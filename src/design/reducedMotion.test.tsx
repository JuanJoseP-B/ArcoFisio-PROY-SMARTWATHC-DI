import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion, usePrefersReducedMotion } from './reducedMotion'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.unstubAllGlobals()
})

function fakeMatchMedia(initial: boolean) {
  let matches = initial
  const listeners = new Set<() => void>()
  const list = {
    get matches() {
      return matches
    },
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => list),
  )
  return {
    set(next: boolean) {
      matches = next
      listeners.forEach((cb) => cb())
    },
    listenerCount: () => listeners.size,
  }
}

function mountHook() {
  const latest: { current: boolean | null } = { current: null }
  function Probe() {
    latest.current = usePrefersReducedMotion()
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() => root.render(createElement(Probe)))
  return { latest, root }
}

describe('prefersReducedMotion', () => {
  it('reads the media query', () => {
    fakeMatchMedia(true)
    expect(prefersReducedMotion()).toBe(true)
  })

  it('is false when matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('usePrefersReducedMotion', () => {
  it('starts with the current preference and follows live changes', () => {
    const media = fakeMatchMedia(false)
    const { latest } = mountHook()
    expect(latest.current).toBe(false)

    act(() => media.set(true))
    expect(latest.current).toBe(true)
  })

  it('stops listening on unmount', () => {
    const media = fakeMatchMedia(false)
    const { root } = mountHook()
    expect(media.listenerCount()).toBe(1)
    act(() => root.unmount())
    roots.length = 0
    expect(media.listenerCount()).toBe(0)
  })

  it('renders as "no preference" on the server', () => {
    function Probe() {
      return createElement('span', null, String(usePrefersReducedMotion()))
    }
    expect(renderToString(createElement(Probe))).toContain('false')
  })
})
