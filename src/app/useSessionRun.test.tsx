import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCalibrationRepo } from '../data/calibrationRepo'
import { createStorage } from '../data/storage'
import { FakeStorage } from '../data/testStorage'
import type { SessionRunConfig } from '../domain/sessionRun'
import { createSensorKit } from '../sensors/kit'
import type { UseSessionRun } from './useSessionRun'
import { useSessionRun } from './useSessionRun'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
let frames = new Map<number, FrameRequestCallback>()
let nextId = 1

function flushFrame(now: number) {
  const callbacks = [...frames.values()]
  frames = new Map()
  act(() => callbacks.forEach((cb) => cb(now)))
}

beforeEach(() => {
  frames = new Map()
  nextId = 1
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(nextId, cb)
    return nextId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.unstubAllGlobals()
})

const newKit = () => createSensorKit('sim', createCalibrationRepo(createStorage(new FakeStorage())))
const config: SessionRunConfig = { target: 90, tolerance: 2, painArc: null }

function mount(kit: ReturnType<typeof newKit>, cfg = config) {
  const latest: { current: UseSessionRun | null } = { current: null }
  function Probe() {
    latest.current = useSessionRun({ config: cfg, kit })
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() => root.render(createElement(Probe)))
  return { latest, root }
}

const moveTo = (kit: ReturnType<typeof newKit>, angle: number) =>
  act(() => {
    for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(angle)
  })

describe('useSessionRun', () => {
  it('has no zone until the first frame', () => {
    const kit = newKit()
    const { latest } = mount(kit)
    expect(latest.current?.status).toBe('live')
    expect(latest.current?.zone).toBeNull()
  })

  it('classifies the live angle on every frame', () => {
    const kit = newKit()
    const { latest } = mount(kit)

    moveTo(kit, 20)
    flushFrame(100)
    expect(latest.current?.zone).toBe('far')

    moveTo(kit, 90)
    flushFrame(200)
    expect(latest.current?.zone).toBe('target')

    moveTo(kit, 100)
    flushFrame(300)
    expect(latest.current?.zone).toBe('overshoot')
  })

  it('counts a repetition, its hit and its hold while the arm stays still on the target', () => {
    const kit = newKit()
    const { latest } = mount(kit)

    moveTo(kit, 90)
    flushFrame(1000)
    expect(latest.current?.view.hits).toBe(1)

    // No new sensor sample arrives, yet the hold still completes with the frame clock.
    flushFrame(1500)
    flushFrame(2100)
    moveTo(kit, 5)
    flushFrame(2200)

    expect(latest.current?.view.reps).toBe(1)
    expect(latest.current?.stats().reps).toEqual([{ peak: expect.any(Number), held: true }])
  })

  it('reads the latest config, including a painful arc', () => {
    const kit = newKit()
    const { latest } = mount(kit, { target: 120, tolerance: 2, painArc: { from: 70, to: 100 } })

    moveTo(kit, 80)
    flushFrame(100)
    expect(latest.current?.zone).toBe('pain')
    expect(latest.current?.view.painEntries).toBe(1)
  })

  it('shows no zone and stops ticking when the sensor is not live', () => {
    const kit = newKit()
    const { latest, root } = mount(kit)
    moveTo(kit, 90)
    flushFrame(100)
    expect(latest.current?.zone).toBe('target')

    act(() => kit.tracker.pause())
    expect(latest.current?.zone).toBeNull()
    expect(frames.size).toBe(0)
    act(() => root.unmount())
    roots.length = 0
  })

  it('resets the counters', () => {
    const kit = newKit()
    const { latest } = mount(kit)
    moveTo(kit, 90)
    flushFrame(100)
    expect(latest.current?.view.hits).toBe(1)

    act(() => latest.current?.reset())
    expect(latest.current?.view.hits).toBe(0)
    expect(latest.current?.stats().hits).toBe(0)
  })

  it('stops requesting frames on unmount', () => {
    const kit = newKit()
    const { root } = mount(kit)
    expect(frames.size).toBe(1)
    act(() => root.unmount())
    roots.length = 0
    expect(frames.size).toBe(0)
  })
})
