import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Intro } from './Intro'
import { INTRO_PERIOD_MS } from './frame'

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

function mount(lang: 'es' | 'en') {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(Intro, { lang })))
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
    expect(renderToString(<Intro lang="es" />)).toContain('Cada grado cuenta')
    const en = renderToString(<Intro lang="en" />)
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
})
