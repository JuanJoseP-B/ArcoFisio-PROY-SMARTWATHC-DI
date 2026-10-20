import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { createCalibrationRepo } from '../../data/calibrationRepo'
import { SEED_ROUTINES } from '../../data/seeds'
import { createStorage } from '../../data/storage'
import { FakeStorage } from '../../data/testStorage'
import type { PainArc } from '../../domain/zones'
import type { Feedback } from '../../feedback/feedback'
import { createSensorKit } from '../../sensors/kit'
import { Session, SessionView } from './Session'
import type { UseSessionRun } from '../../app/useSessionRun'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const routine = SEED_ROUTINES[0]! // Abducción 90°, 10 reps
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

function mount(
  kit: ReturnType<typeof newKit>,
  lang: 'es' | 'en' = 'es',
  painArc: PainArc | null = null,
  feedback?: Feedback,
  onMeasure?: () => void,
) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang },
        createElement(Session, {
          routine,
          painArc,
          kit,
          ...(feedback ? { feedback } : {}),
          ...(onMeasure ? { onMeasure } : {}),
        }),
      ),
    ),
  )
  return { host, root }
}

const moveTo = (kit: ReturnType<typeof newKit>, angle: number) =>
  act(() => {
    for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(angle)
  })

const chip = (host: HTMLElement) => host.querySelector('[data-part="zone-chip"]')
const ring = (host: HTMLElement) => host.querySelector('[data-part="goniometer-ring"]')
const reading = (host: HTMLElement) => host.querySelector('[data-part="angle"]')?.textContent

describe('Session', () => {
  it('shows the routine name, the reading and the repetition counter', () => {
    const kit = newKit()
    const { host } = mount(kit)
    expect(host.textContent).toContain('Abducción 90°')
    expect(reading(host)).toBe('0°')
    expect(host.querySelector('[data-part="reps"]')?.textContent).toBe('Repeticiones0 de 10')
  })

  it('follows the angle with the hero number and the ring', () => {
    const kit = newKit()
    const { host } = mount(kit)
    moveTo(kit, 45)
    expect(reading(host)).toBe('45°')
    // The sensor filter is still settling, so the knob sits within a degree of 45.
    const transform = host.querySelector('[data-part="knob"]')?.getAttribute('transform') ?? ''
    expect(Number(/rotate\(([\d.]+) /.exec(transform)?.[1])).toBeCloseTo(45, 0)
  })

  it('says "Objetivo alcanzado" on the target and "Te pasaste" past it', () => {
    const kit = newKit()
    const { host } = mount(kit)

    moveTo(kit, 90)
    flushFrame(100)
    expect(chip(host)?.textContent).toBe('Objetivo alcanzado')
    expect(ring(host)?.getAttribute('data-zone')).toBe('target')

    moveTo(kit, 100)
    flushFrame(200)
    expect(chip(host)?.textContent).toBe('Te pasaste')
    expect(ring(host)?.getAttribute('data-zone')).toBe('overshoot')
  })

  it('walks the approach words as the arm rises', () => {
    const kit = newKit()
    const { host } = mount(kit)
    const words: string[] = []
    let t = 0
    for (const angle of [10, 70, 84, 90]) {
      moveTo(kit, angle)
      flushFrame((t += 50))
      words.push(chip(host)?.textContent ?? '')
    }
    expect(words).toEqual(['En camino', 'Casi', 'Muy cerca', 'Objetivo alcanzado'])
  })

  it('speaks English when the language is English', () => {
    const kit = newKit()
    const { host } = mount(kit, 'en')
    moveTo(kit, 100)
    flushFrame(100)
    expect(chip(host)?.textContent).toBe('Too far')
    expect(host.textContent).toContain('Abduction 90°')
    expect(host.querySelector('[data-part="reps"]')?.textContent).toBe('Repetitions0 of 10')
  })

  it('counts a repetition after holding the target for a second and coming back', () => {
    const kit = newKit()
    const { host } = mount(kit)
    moveTo(kit, 90)
    flushFrame(1000)
    flushFrame(2100)
    moveTo(kit, 5)
    flushFrame(2200)
    expect(host.querySelector('[data-part="reps"]')?.textContent).toBe('Repeticiones1 de 10')
  })

  it('warns when the arm enters the painful arc', () => {
    const kit = newKit()
    const { host } = mount(kit, 'es', { from: 60, to: 80 })
    moveTo(kit, 70)
    flushFrame(100)
    expect(chip(host)?.textContent).toBe('Dolor')
  })

  it('replaces the chip with a notice and a way to Measure when calibration is missing', () => {
    const kit = newKit()
    const onMeasure = vi.fn()
    const { host } = mount(kit, 'es', null, undefined, onMeasure)
    act(() => kit.tracker.setCalibration(null))

    expect(chip(host)).toBeNull()
    expect(host.querySelector('[data-part="sensor-notice"]')?.textContent).toContain(
      'Calibra con el brazo abajo',
    )
    expect(host.querySelector('button')?.textContent).toBe('Medir')
    act(() => host.querySelector('button')?.click())
    expect(onMeasure).toHaveBeenCalledTimes(1)
    expect(reading(host)).toBe('--°')
  })

  it('keeps the screen awake while open', async () => {
    const release = vi.fn(() => Promise.resolve())
    const request = vi.fn(() => Promise.resolve({ release }))
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true })

    const { root } = mount(newKit())
    await act(async () => undefined)
    expect(request).toHaveBeenCalledWith('screen')

    await act(async () => root.unmount())
    roots.length = 0
    expect(release).toHaveBeenCalled()

    Reflect.deleteProperty(navigator, 'wakeLock')
  })

  it('plays the zone feedback while the arm moves', () => {
    const played: (string | null)[] = []
    const feedback = {
      tick: (input: { zone: string | null }) => played.push(input.zone),
      stop: vi.fn(),
    } as unknown as Feedback
    const kit = newKit()
    mount(kit, 'es', null, feedback)

    moveTo(kit, 90)
    flushFrame(100)
    moveTo(kit, 100)
    flushFrame(200)

    expect(played).toEqual(['target', 'overshoot'])
  })

  it('stays silent when no feedback is given', () => {
    const kit = newKit()
    const { host } = mount(kit)
    moveTo(kit, 90)
    expect(() => flushFrame(100)).not.toThrow()
    expect(chip(host)?.textContent).toBe('Objetivo alcanzado')
  })

  describe('SessionView', () => {
    const fakeRun = (reps: number): UseSessionRun =>
      ({
        angle: 42,
        status: 'live',
        zone: 'far',
        view: { zone: 'far', reps, hits: 0, overshoots: 0, painEntries: 0, maxAngle: 42 },
      }) as unknown as UseSessionRun

    const show = (caption?: string, reps = 4) => {
      const host = document.createElement('div')
      const root = createRoot(host)
      roots.push(root)
      act(() =>
        root.render(
          createElement(
            I18nProvider,
            { lang: 'es' },
            createElement(SessionView, {
              routine,
              run: fakeRun(reps),
              ...(caption ? { caption } : {}),
            }),
          ),
        ),
      )
      return host
    }

    it('draws a run it is handed, without starting one of its own', () => {
      const host = show(undefined, 4)
      expect(reading(host)).toBe('42°')
      expect(host.querySelector('[data-part="reps"]')?.textContent).toContain('4 de 10')
      expect(host.querySelector('[data-part="set-caption"]')).toBeNull()
    })

    it('adds a line under the repetitions when given one', () => {
      const host = show('Serie 2 de 3')
      expect(host.querySelector('[data-part="set-caption"]')?.textContent).toBe('Serie 2 de 3')
    })
  })
})
