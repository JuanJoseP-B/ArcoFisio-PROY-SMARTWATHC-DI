import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFrameClock } from './useFrameClock'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
let pending = new Map<number, FrameRequestCallback>()
let nextId = 1
const cancelled: number[] = []

function flushFrame(now: number) {
  const callbacks = [...pending.values()]
  pending = new Map()
  act(() => callbacks.forEach((cb) => cb(now)))
}

beforeEach(() => {
  pending = new Map()
  nextId = 1
  cancelled.length = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    pending.set(nextId, cb)
    return nextId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    cancelled.push(id)
    pending.delete(id)
  })
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.unstubAllGlobals()
})

function mount(active: boolean) {
  const latest: { current: number } = { current: -1 }
  function Probe({ on }: { on: boolean }) {
    latest.current = useFrameClock(on)
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() => root.render(createElement(Probe, { on: active })))
  return { latest, render: (on: boolean) => act(() => root.render(createElement(Probe, { on }))) }
}

describe('useFrameClock', () => {
  it('counts from the first frame it sees', () => {
    const { latest } = mount(true)
    flushFrame(5000)
    expect(latest.current).toBe(0)
    flushFrame(5016)
    flushFrame(5050)
    expect(latest.current).toBe(50)
  })

  it('does not schedule frames while inactive', () => {
    const { latest } = mount(false)
    expect(pending.size).toBe(0)
    expect(latest.current).toBe(0)
  })

  it('cancels the pending frame and resets when it turns inactive', () => {
    const { latest, render } = mount(true)
    flushFrame(100)
    flushFrame(300)
    expect(latest.current).toBe(200)

    render(false)
    expect(cancelled.length).toBeGreaterThan(0)
    expect(pending.size).toBe(0)
    expect(latest.current).toBe(0)
  })

  it('cancels its frame on unmount', () => {
    mount(true)
    const before = cancelled.length
    for (const root of roots.splice(0)) act(() => root.unmount())
    expect(cancelled.length).toBe(before + 1)
  })
})
