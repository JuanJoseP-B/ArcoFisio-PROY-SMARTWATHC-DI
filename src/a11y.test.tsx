import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from './app/I18nProvider'
import { SEED_ROUTINES } from './data/seeds'
import { NavHost } from './screens/navigation/NavHost'
import { NavProvider } from './screens/navigation/NavProvider'
import type { Route, ScreenId } from './screens/navigation/stack'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
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

/** Every screen of the watch, with a routine where the screen needs one. */
const routine = SEED_ROUTINES[0]!.id
const ROUTES: Route[] = [
  { id: 'intro' },
  { id: 'language' },
  { id: 'setup' },
  { id: 'face' },
  { id: 'launcher' },
  { id: 'mode' },
  { id: 'config', exercise: 'abduction' },
  { id: 'counts', exercise: 'flexion' },
  { id: 'session', routineId: routine },
  { id: 'measure' },
  { id: 'routines' },
  { id: 'routine', routineId: routine },
  { id: 'builder' },
  { id: 'summary' },
  { id: 'history' },
  { id: 'pain' },
  { id: 'guide' },
  { id: 'settings' },
]

function show(route: Route, lang: 'es' | 'en') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang, onLangChange: () => undefined },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'face' as ScreenId }, route] } },
          createElement(NavHost),
        ),
      ),
    ),
  )
  return host
}

/** What a screen reader announces for an element: its label, its text or its title. */
function accessibleName(el: Element, host: HTMLElement): string {
  const label = el.getAttribute('aria-label')?.trim()
  if (label) return label
  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = labelledBy
      .split(' ')
      .map((id) => host.querySelector(`[id="${id}"]`)?.textContent ?? '')
      .join(' ')
      .trim()
    if (text) return text
  }
  const text = el.textContent?.trim()
  if (text) return text
  return el.getAttribute('title')?.trim() ?? ''
}

const CONTROLS =
  'button, [role="button"], [role="slider"], [role="switch"], input, select, textarea'

describe.each(['es', 'en'] as const)('screen reader support in %s', (lang) => {
  it('finds the controls it is meant to check', () => {
    const settings = show({ id: 'settings' }, lang)
    expect(settings.querySelectorAll(CONTROLS).length).toBeGreaterThanOrEqual(6)
    const launcher = show({ id: 'launcher' }, lang)
    expect(launcher.querySelectorAll(CONTROLS).length).toBeGreaterThanOrEqual(7)
  })

  it.each(ROUTES.map((route) => [route.id, route] as const))(
    '%s names every control',
    (_id, route) => {
      const host = show(route, lang)
      const unnamed = [...host.querySelectorAll(CONTROLS)].filter((el) => !accessibleName(el, host))
      expect(unnamed.map((el) => el.outerHTML.slice(0, 120))).toEqual([])
    },
  )

  it.each(ROUTES.map((route) => [route.id, route] as const))(
    '%s hides decoration and never forces a tab order',
    (_id, route) => {
      const host = show(route, lang)
      const positive = [...host.querySelectorAll('[tabindex]')].filter(
        (el) => Number(el.getAttribute('tabindex')) > 0,
      )
      expect(positive).toHaveLength(0)
      // A picture needs either a description or to be hidden from assistive technology.
      const pictures = [...host.querySelectorAll('svg, img')].filter(
        (el) =>
          el.getAttribute('aria-hidden') !== 'true' &&
          !el.closest('[aria-hidden="true"]') &&
          el.getAttribute('role') !== 'img' &&
          !el.getAttribute('aria-label') &&
          !(el.tagName === 'IMG' && el.getAttribute('alt')),
      )
      expect(pictures.map((el) => el.outerHTML.slice(0, 100))).toEqual([])
    },
  )
})
