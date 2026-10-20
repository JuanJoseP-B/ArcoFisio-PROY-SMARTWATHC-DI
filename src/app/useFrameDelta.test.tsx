import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFrameDelta } from './useFrameDelta'

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

function mount(onDelta: (dt: number) => void, active = true) {
  function Probe({ on }: { on: boolean }) {
    useFrameDelta(on, onDelta)
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  const show = (on: boolean) => act(() => root.render(createElement(Probe, { on })))
  show(active)
  return { show, root }
}

describe('useFrameDelta', () => {
  it('reports the time between frames, not the first one', () => {
    const onDelta = vi.fn()
    mount(onDelta)

    flushFrame(1000)
    expect(onDelta).not.toHaveBeenCalled()
    flushFrame(1016)
    flushFrame(1050)
    expect(onDelta.mock.calls.map(([dt]) => dt)).toEqual([16, 34])
  })

  it('asks for no frames while inactive', () => {
    mount(vi.fn(), false)
    expect(frames.size).toBe(0)
  })

  it('does not count the time spent inactive', () => {
    const onDelta = vi.fn()
    const { show } = mount(onDelta)
    flushFrame(1000)
    flushFrame(1016)

    show(false)
    expect(frames.size).toBe(0)
    show(true)
    flushFrame(9000)
    flushFrame(9016)

    expect(onDelta.mock.calls.map(([dt]) => dt)).toEqual([16, 16])
  })

  it('always calls the latest callback', () => {
    const first = vi.fn()
    const second = vi.fn()
    function Probe({ cb }: { cb: (dt: number) => void }) {
      useFrameDelta(true, cb)
      return null
    }
    const root = createRoot(document.createElement('div'))
    roots.push(root)
    act(() => root.render(createElement(Probe, { cb: first })))
    flushFrame(100)
    act(() => root.render(createElement(Probe, { cb: second })))
    flushFrame(120)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(20)
  })

  it('stops on unmount', () => {
    const { root } = mount(vi.fn())
    expect(frames.size).toBe(1)
    act(() => root.unmount())
    roots.length = 0
    expect(frames.size).toBe(0)
  })
})
