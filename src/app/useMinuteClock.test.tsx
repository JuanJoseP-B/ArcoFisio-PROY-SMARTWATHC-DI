import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { msToNextMinute, useMinuteClock } from './useMinuteClock'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.useRealTimers()
})

describe('msToNextMinute', () => {
  it('counts the time left in the current minute plus a small margin', () => {
    expect(msToNextMinute(new Date(2026, 9, 20, 14, 5, 0, 0))).toBe(60_020)
    expect(msToNextMinute(new Date(2026, 9, 20, 14, 5, 45, 500))).toBe(14_520)
    expect(msToNextMinute(new Date(2026, 9, 20, 14, 5, 59, 999))).toBe(21)
  })
})

describe('useMinuteClock', () => {
  function mount(now: () => Date) {
    const latest: { current: Date | null } = { current: null }
    function Probe() {
      latest.current = useMinuteClock(now)
      return null
    }
    const root = createRoot(document.createElement('div'))
    roots.push(root)
    act(() => root.render(createElement(Probe)))
    return { latest, root }
  }

  it('shows the time and refreshes at the start of the next minute, not before', () => {
    let current = new Date(2026, 9, 20, 14, 5, 30, 0)
    const { latest } = mount(() => current)
    expect(latest.current?.getMinutes()).toBe(5)

    current = new Date(2026, 9, 20, 14, 6, 0, 30)
    act(() => {
      vi.advanceTimersByTime(29_000)
    })
    expect(latest.current?.getMinutes()).toBe(5)

    act(() => {
      vi.advanceTimersByTime(1_100)
    })
    expect(latest.current?.getMinutes()).toBe(6)
  })

  it('keeps going minute after minute with one timeout at a time', () => {
    let current = new Date(2026, 9, 20, 14, 5, 59, 0)
    const { latest } = mount(() => current)

    current = new Date(2026, 9, 20, 14, 6, 0, 40)
    act(() => {
      vi.advanceTimersByTime(1_100)
    })
    expect(latest.current?.getMinutes()).toBe(6)
    expect(vi.getTimerCount()).toBe(1)

    current = new Date(2026, 9, 20, 14, 7, 0, 40)
    act(() => {
      vi.advanceTimersByTime(60_100)
    })
    expect(latest.current?.getMinutes()).toBe(7)
    expect(vi.getTimerCount()).toBe(1)
  })

  it('leaves no timer behind on unmount', () => {
    const { root } = mount(() => new Date(2026, 9, 20, 14, 5, 30))
    expect(vi.getTimerCount()).toBe(1)
    act(() => root.unmount())
    roots.length = 0
    expect(vi.getTimerCount()).toBe(0)
  })
})
