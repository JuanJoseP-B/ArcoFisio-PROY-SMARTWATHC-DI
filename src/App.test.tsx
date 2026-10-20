import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { getFeedback } from './feedback'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const open = (search: string) => window.history.replaceState(null, '', `/${search}`)

afterEach(() => open(''))

function mount() {
  const host = document.createElement('div')
  const root = createRoot(host)
  act(() => root.render(createElement(App)))
  return { host, root }
}

describe('App', () => {
  it('opens on the intro inside the radial transition', () => {
    const html = renderToString(<App />)
    expect(html).toContain('data-part="radial-transition"')
    expect(html).toContain('data-part="intro"')
    expect(html).toContain('ARCO')
    expect(html).toContain('FISIO')
    expect(html).not.toContain('data-part="simulator-panel"')
  })

  it('opens the live session with ?session=1 and shows the simulator with ?sim=1', () => {
    open('?session=1&sim=1')
    const { host, root } = mount()

    expect(host.querySelector('[data-part="session"]')).not.toBeNull()
    expect(host.querySelector('[data-part="intro"]')).toBeNull()
    expect(host.querySelector('[data-part="simulator-panel"]')).not.toBeNull()
    expect(host.querySelector('[data-part="goniometer-ring"]')).not.toBeNull()
    act(() => root.unmount())
  })

  it('picks the routine named by ?routine= and falls back to the first one', () => {
    open('?session=1&sim=1&routine=builtin-flexion-150')
    const named = mount()
    expect(named.host.querySelector('[data-part="session"]')?.textContent).toMatch(/150°/)
    act(() => named.root.unmount())

    open('?session=1&sim=1&routine=does-not-exist')
    const fallback = mount()
    expect(fallback.host.querySelector('[data-part="session"]')?.textContent).toMatch(/90°/)
    act(() => fallback.root.unmount())
  })

  it('keeps the simulator control out of the watch circle', () => {
    open('?session=1&sim=1')
    const { host, root } = mount()
    const screen = host.querySelector('[data-part="screen"]')
    const panel = host.querySelector('[data-part="simulator-panel"]')
    expect(screen?.contains(panel)).toBe(false)
    act(() => root.unmount())
  })

  it('unlocks the audio on the first touch of the page', async () => {
    const { root } = mount()
    expect(getFeedback().audio.state).toBe('locked')

    // jsdom has no Web Audio, so the attempt ends as "unsupported": it did try on the gesture.
    await act(async () => {
      document.dispatchEvent(new Event('pointerdown'))
    })
    expect(getFeedback().audio.state).toBe('unsupported')
    act(() => root.unmount())
  })
})
