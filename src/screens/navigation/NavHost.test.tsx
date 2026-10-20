import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { INTRO_END_MS } from '../intro/frame'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavHost } from './NavHost'
import { NavProvider } from './NavProvider'
import type { NavState } from './stack'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
let frames = new Map<number, FrameRequestCallback>()
let nextId = 1

beforeEach(() => {
  localStorage.clear()
  frames = new Map()
  nextId = 1
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(nextId, cb)
    return nextId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })),
  )
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function flushFrame(now: number) {
  const callbacks = [...frames.values()]
  frames = new Map()
  act(() => callbacks.forEach((cb) => cb(now)))
}

function mount(initial?: NavState, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang },
        createElement(NavProvider, initial ? { initial } : {}, createElement(NavHost)),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const click = (el: Element | null) => act(() => (el as HTMLElement | null)?.click())
  const escape = () =>
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
  return { host, part, click, escape }
}

const FACE: NavState = { stack: [{ id: 'face' }] }

describe('NavHost: start', () => {
  it('opens on the intro, and a tap hands over to the watch face', () => {
    const { part, click } = mount()
    expect(part('intro')).not.toBeNull()

    click(part('intro-skip'))
    expect(part('intro')).toBeNull()
    expect(part('face')).not.toBeNull()
  })

  it('moves on to the face by itself when the intro ends', () => {
    const { part } = mount()
    flushFrame(100)
    flushFrame(100 + INTRO_END_MS)
    expect(part('face')).not.toBeNull()
  })

  it('does not return to the intro with back from the face', () => {
    const { part, click, escape } = mount()
    click(part('intro-skip'))
    escape()
    expect(part('face')).not.toBeNull()
    expect(part('intro')).toBeNull()
  })

  it('wraps every screen in the radial entrance', () => {
    const { part } = mount(FACE)
    expect(part('radial-transition')).not.toBeNull()
  })
})

describe('NavHost: every app opens from the launcher and the way back always works', () => {
  const APPS = [
    ['measure', 'Medir'],
    ['routines', 'Rutinas'],
    ['summary', 'Resumen'],
    ['pain', 'Dolor'],
    ['guide', 'Guía IA'],
    ['settings', 'Ajustes'],
  ] as const

  for (const [cell, title] of APPS) {
    it(`${title}: opens, shows its name and returns with the back button and with Escape`, () => {
      const { part, host, click, escape } = mount(FACE)

      click(part('face'))
      expect(part('hex-launcher')).not.toBeNull()

      click(host.querySelector(`[data-cell="${cell}"]`))
      expect(part('placeholder')?.querySelector('h1')?.textContent).toBe(title)

      click(part('back-button'))
      expect(part('hex-launcher')).not.toBeNull()

      click(host.querySelector(`[data-cell="${cell}"]`))
      escape()
      expect(part('hex-launcher')).not.toBeNull()

      escape()
      expect(part('face')).not.toBeNull()
    })
  }

  const start = (host: HTMLElement, click: (el: Element | null) => void) => {
    click(host.querySelector('[data-part="confirm-button"]'))
    click(host.querySelector('[data-part="pill-button"]'))
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }

  it('Session: launcher, exercise selector, configuration, live session, and all the way back', () => {
    const { part, host, click, escape } = mount(FACE)

    click(part('face'))
    click(host.querySelector('[data-cell="session"]'))
    expect(part('mode-select')).not.toBeNull()

    click(host.querySelectorAll('[data-part="pill-button"]')[0] ?? null)
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(part('config')?.dataset.exercise).toBe('abduction')
    expect(part('angle-wheel')).not.toBeNull()

    click(host.querySelector('[data-part="confirm-button"]'))
    expect(part('counts')).not.toBeNull()
    click(host.querySelector('[data-part="pill-button"]'))
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(part('session')).not.toBeNull()
    expect(part('back-button')?.dataset.placement).toBe('bottom')
    expect(host.textContent).toContain('Abducción personalizada')

    click(part('back-button'))
    expect(part('counts')).not.toBeNull()
    escape()
    expect(part('config')).not.toBeNull()
    escape()
    expect(part('mode-select')).not.toBeNull()
    escape()
    expect(part('hex-launcher')).not.toBeNull()
    escape()
    expect(part('face')).not.toBeNull()
  })

  it('Session with flexion runs the custom flexion routine', () => {
    const { part, host, click } = mount({
      stack: [{ id: 'face' }, { id: 'launcher' }, { id: 'mode' }],
    })
    click(host.querySelectorAll('[data-part="pill-button"]')[1] ?? null)
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(part('config')?.dataset.exercise).toBe('flexion')
    start(host, click)
    expect(part('session')).not.toBeNull()
    expect(host.textContent).toContain('Flexión personalizada')
  })

  it('works the same in English', () => {
    const { part, host, click } = mount(FACE, 'en')
    click(part('face'))
    click(host.querySelector('[data-cell="guide"]'))
    expect(part('placeholder')?.querySelector('h1')?.textContent).toBe('AI Guide')
    expect(part('back-button')?.getAttribute('aria-label')).toBe('Back')
  })
})

describe('NavHost: swipe back', () => {
  function swipe(target: Element, from: number, to: number) {
    act(() => {
      target.dispatchEvent(
        new MouseEvent('pointerdown', { clientX: from, clientY: 200, bubbles: true }),
      )
      target.dispatchEvent(
        new MouseEvent('pointerup', { clientX: to, clientY: 205, bubbles: true }),
      )
    })
  }

  it('goes back on a right swipe and stays on the face at the bottom of the stack', () => {
    const { part, host, click } = mount(FACE)
    const surface = part('nav-host')!
    surface.getBoundingClientRect = () => ({ width: 384 }) as DOMRect

    click(part('face'))
    click(host.querySelector('[data-cell="pain"]'))
    expect(part('placeholder')).not.toBeNull()

    swipe(surface, 100, 240)
    expect(part('hex-launcher')).not.toBeNull()
    swipe(surface, 100, 240)
    expect(part('face')).not.toBeNull()
    swipe(surface, 100, 240)
    expect(part('face')).not.toBeNull()
  })
})
