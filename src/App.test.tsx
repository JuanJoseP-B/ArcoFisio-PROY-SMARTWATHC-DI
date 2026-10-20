import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { getFeedback } from './feedback'
import { PRESS_DELAY_MS } from './ui/pressTiming'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const open = (search: string) => window.history.replaceState(null, '', `/${search}`)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  open('')
  vi.useRealTimers()
})

function mount() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(createElement(App)))
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const click = (el: Element | null) => act(() => (el as HTMLElement | null)?.click())
  const unmount = () => {
    act(() => root.unmount())
    host.remove()
  }
  return { host, part, click, unmount }
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

  it('goes from the intro to the face, the launcher, the exercise selector and a live session', () => {
    open('?sim=1')
    const { host, part, click, unmount } = mount()

    click(part('intro-skip'))
    expect(part('face')).not.toBeNull()
    click(part('face'))
    click(host.querySelector('[data-cell="session"]'))
    expect(part('mode-select')).not.toBeNull()

    click(host.querySelectorAll('[data-part="pill-button"]')[0] ?? null)
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(part('session')).not.toBeNull()
    expect(part('goniometer-ring')).not.toBeNull()
    unmount()
  })

  it('shows the simulator only with ?sim=1 and keeps it out of the watch circle', () => {
    const plain = mount()
    expect(plain.part('simulator-panel')).toBeNull()
    plain.unmount()

    open('?sim=1')
    const sim = mount()
    const panel = sim.part('simulator-panel')
    expect(panel).not.toBeNull()
    expect(sim.part('screen')?.contains(panel)).toBe(false)
    sim.unmount()
  })

  it('unlocks the audio on the first touch of the page', async () => {
    const { unmount } = mount()
    expect(getFeedback().audio.state).toBe('locked')

    // jsdom has no Web Audio, so the attempt ends as "unsupported": it did try on the gesture.
    await act(async () => {
      document.dispatchEvent(new Event('pointerdown'))
    })
    expect(getFeedback().audio.state).toBe('unsupported')
    unmount()
  })
})
