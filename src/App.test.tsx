import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { getDataLayer } from './data'
import { getFeedback } from './feedback'
import { PRESS_DELAY_MS } from './ui/pressTiming'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const open = (search: string) => window.history.replaceState(null, '', `/${search}`)

beforeEach(() => {
  localStorage.clear()
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

  it('goes from the intro to the face, the launcher, the exercise, its configuration and a live session', () => {
    open('?sim=1')
    getDataLayer().settings.update({ firstRunDone: true })
    const { host, part, click, unmount } = mount()

    click(part('intro-skip'))
    expect(part('face')).not.toBeNull()
    click(part('face'))
    click(host.querySelector('[data-cell="session"]'))
    expect(part('mode-select')).not.toBeNull()

    const pressPill = () => {
      click(host.querySelector('[data-part="pill-button"]'))
      act(() => {
        vi.advanceTimersByTime(PRESS_DELAY_MS)
      })
    }
    pressPill()
    expect(part('angle-wheel')).not.toBeNull()
    click(part('confirm-button'))
    expect(part('counts')).not.toBeNull()
    pressPill()
    expect(part('session')).not.toBeNull()
    expect(part('goniometer-ring')).not.toBeNull()
    unmount()
  })

  it('remembers the language chosen on the first run when the app is reopened', () => {
    open('?sim=1')
    const first = mount()
    first.click(first.part('intro-skip'))
    expect(first.part('language-select')).not.toBeNull()

    first.click(first.host.querySelectorAll('[data-part="pill-button"]')[1] ?? null)
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(first.part('sensor-setup')).not.toBeNull()
    first.unmount()

    expect(getDataLayer().settings.get().lang).toBe('en')
    expect(renderToString(<App />)).toContain('Every degree counts')
  })

  it('keeps the target chosen on the wheel after closing and reopening', () => {
    open('?sim=1')
    getDataLayer().settings.update({ firstRunDone: true })

    const toWheel = () => {
      const app = mount()
      app.click(app.part('intro-skip'))
      app.click(app.part('face'))
      app.click(app.host.querySelector('[data-cell="session"]'))
      app.click(app.host.querySelector('[data-part="pill-button"]'))
      act(() => {
        vi.advanceTimersByTime(PRESS_DELAY_MS)
      })
      return app
    }

    const first = toWheel()
    // The wheel is scrolled rather than keyed: a key press would also unlock the audio.
    act(() => {
      for (let notch = 0; notch < 3; notch += 1) {
        first
          .part('angle-wheel')
          ?.dispatchEvent(
            new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }),
          )
      }
    })
    expect(first.part('wheel-value')?.textContent).toBe('105°')
    first.unmount()

    const reopened = toWheel()
    expect(reopened.part('wheel-value')?.textContent).toBe('105°')
    reopened.unmount()
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
