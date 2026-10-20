import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import type { Nav } from './NavContext'
import { NavProvider } from './NavProvider'
import { useNav } from './useNav'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(initial?: Parameters<typeof NavProvider>[0]['initial']) {
  const latest: { current: Nav | null } = { current: null }
  function Probe() {
    latest.current = useNav()
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() =>
    root.render(createElement(NavProvider, initial ? { initial } : {}, createElement(Probe))),
  )
  return { nav: () => latest.current!, root }
}

describe('NavProvider', () => {
  it('starts on the intro with nowhere to go back', () => {
    const { nav } = mount()
    expect(nav().route.id).toBe('intro')
    expect(nav().canGoBack).toBe(false)
  })

  it('pushes, replaces and goes back', () => {
    const { nav } = mount()
    act(() => nav().replace({ id: 'face' }))
    act(() => nav().push({ id: 'launcher' }))
    expect(nav().route.id).toBe('launcher')
    expect(nav().canGoBack).toBe(true)

    act(() => nav().back())
    expect(nav().route.id).toBe('face')
    expect(nav().canGoBack).toBe(false)
  })

  it('goes back with the Escape key, and ignores other keys', () => {
    const { nav } = mount({ stack: [{ id: 'face' }, { id: 'launcher' }] })
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    })
    expect(nav().route.id).toBe('launcher')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(nav().route.id).toBe('face')
  })

  it('stops listening for Escape after unmount', () => {
    const { nav, root } = mount({ stack: [{ id: 'face' }, { id: 'launcher' }] })
    const before = nav().route.id
    act(() => root.unmount())
    roots.length = 0
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(before).toBe('launcher')
  })

  it('fails loudly when a screen is used outside the provider', () => {
    function Lost() {
      useNav()
      return null
    }
    const root = createRoot(document.createElement('div'))
    roots.push(root)
    const quiet = () => undefined
    const original = console.error
    console.error = quiet
    try {
      expect(() => act(() => root.render(createElement(Lost)))).toThrow(/NavProvider/)
    } finally {
      console.error = original
    }
    roots.length = 0
  })
})
