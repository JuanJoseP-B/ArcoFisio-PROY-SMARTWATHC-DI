import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { Intro } from './Intro'
import { INTRO_END_MS, INTRO_PERIOD_MS, INTRO_REDUCED_HOLD_MS } from './frame'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
let frames = new Map<number, FrameRequestCallback>()
let nextId = 1

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: reduced,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })),
  )
}

function flushFrame(now: number) {
  const callbacks = [...frames.values()]
  frames = new Map()
  act(() => callbacks.forEach((cb) => cb(now)))
}

function mount(lang: 'es' | 'en', onDone?: () => void) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(I18nProvider, { lang }, createElement(Intro, onDone ? { onDone } : {})),
    ),
  )
  return host
}

beforeEach(() => {
  frames = new Map()
  nextId = 1
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(nextId, cb)
    return nextId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  stubReducedMotion(false)
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.unstubAllGlobals()
  document.head.querySelectorAll('link').forEach((link) => link.remove())
})

describe('Intro', () => {
  it('renders the wordmark with the tagline in each language', () => {
    expect(
      renderToString(
        <I18nProvider lang="es">
          <Intro />
        </I18nProvider>,
      ),
    ).toContain('Cada grado cuenta')
    const en = renderToString(
      <I18nProvider lang="en">
        <Intro />
      </I18nProvider>,
    )
    expect(en).toContain('Every degree counts')
    expect(en).toContain('ARCO')
    expect(en).toContain('FISIO')
  })

  it('loads the brand font', () => {
    mount('es')
    const hrefs = Array.from(document.head.querySelectorAll('link')).map((l) => l.href)
    expect(hrefs.some((href) => href.includes('Cinzel'))).toBe(true)
  })

  it('animates frame by frame and loops every 9 s', () => {
    const host = mount('es')
    const opacity = () =>
      Number(host.querySelector<HTMLElement>('[data-part="wordmark"]')?.style.opacity)

    flushFrame(1000)
    expect(opacity()).toBe(0)

    flushFrame(1000 + 0.76 * INTRO_PERIOD_MS)
    expect(opacity()).toBe(1)

    // One period later the lockup has faded out and the loop starts over.
    flushFrame(1000 + INTRO_PERIOD_MS + 10)
    expect(opacity()).toBe(0)
    expect(frames.size).toBe(1)
  })

  it('shows the finished lockup with a fade and no frame loop under reduced motion', () => {
    stubReducedMotion(true)
    const host = mount('en')
    const intro = host.querySelector<HTMLElement>('[data-part="intro"]')

    expect(intro?.dataset.motion).toBe('reduced')
    expect(intro?.className).toContain('still')
    expect(frames.size).toBe(0)
    expect(Number(host.querySelector<HTMLElement>('[data-part="wordmark"]')?.style.opacity)).toBe(1)
  })

  it('stops requesting frames when it unmounts', () => {
    mount('es')
    expect(frames.size).toBe(1)
    for (const root of roots.splice(0)) act(() => root.unmount())
    expect(frames.size).toBe(0)
  })

  describe('played once', () => {
    it('ends with the lockup on screen and calls onDone once, not before', () => {
      const onDone = vi.fn()
      const host = mount('es', onDone)
      const opacity = () =>
        Number(host.querySelector<HTMLElement>('[data-part="wordmark"]')?.style.opacity)

      flushFrame(1000)
      flushFrame(1000 + INTRO_END_MS - 100)
      expect(onDone).not.toHaveBeenCalled()

      flushFrame(1000 + INTRO_END_MS)
      expect(onDone).toHaveBeenCalledTimes(1)
      expect(opacity()).toBe(1)

      flushFrame(1000 + INTRO_PERIOD_MS * 2)
      expect(onDone).toHaveBeenCalledTimes(1)
      expect(opacity()).toBe(1)
    })

    it('can be skipped with a tap, only once', () => {
      const onDone = vi.fn()
      const host = mount('en', onDone)
      const skip = host.querySelector<HTMLButtonElement>('[data-part="intro-skip"]')
      expect(skip?.getAttribute('aria-label')).toBe('Skip the intro')

      act(() => skip?.click())
      act(() => skip?.click())
      expect(onDone).toHaveBeenCalledTimes(1)

      flushFrame(1000)
      flushFrame(1000 + INTRO_END_MS)
      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('has the skip button in Spanish too', () => {
      const host = mount('es', () => undefined)
      expect(host.querySelector('[data-part="intro-skip"]')?.getAttribute('aria-label')).toBe(
        'Saltar la introducción',
      )
    })

    it('shows the still lockup for a moment under reduced motion, then moves on', () => {
      stubReducedMotion(true)
      const onDone = vi.fn()
      mount('es', onDone)

      flushFrame(500)
      flushFrame(500 + INTRO_REDUCED_HOLD_MS - 1)
      expect(onDone).not.toHaveBeenCalled()
      flushFrame(500 + INTRO_REDUCED_HOLD_MS)
      expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('does not offer a skip button when it just loops', () => {
      const host = mount('es')
      expect(host.querySelector('[data-part="intro-skip"]')).toBeNull()
    })
  })
})
