import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Launcher } from './Launcher'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(lang: 'es' | 'en') {
  const host = document.createElement('div')
  const seen = { route: '' }
  function Spy() {
    seen.route = useNav().route.id
    return null
  }
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'face' }, { id: 'launcher' }] } },
          createElement(Launcher),
          createElement(Spy),
        ),
      ),
    ),
  )
  const cell = (id: string) => host.querySelector<HTMLButtonElement>(`[data-cell="${id}"]`)!
  return { host, seen, cell }
}

describe('Launcher', () => {
  it('names the seven apps in Spanish', () => {
    const { host } = mount('es')
    const labels = [...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual(['Medir', 'Sesión', 'Rutinas', 'Resumen', 'Dolor', 'Guía IA', 'Ajustes'])
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Aplicaciones')
  })

  it('names the seven apps in English', () => {
    const { host } = mount('en')
    const labels = [...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual([
      'Measure',
      'Session',
      'Routines',
      'Summary',
      'Pain',
      'AI Guide',
      'Settings',
    ])
  })

  it('opens each app on its own screen', () => {
    for (const [cell, route] of [
      ['measure', 'measure'],
      ['routines', 'routines'],
      ['summary', 'summary'],
      ['pain', 'pain'],
      ['guide', 'guide'],
      ['settings', 'settings'],
    ] as const) {
      const { seen, cell: get } = mount('es')
      act(() => get(cell).click())
      expect(seen.route, cell).toBe(route)
    }
  })

  it('opens the exercise selector from Session', () => {
    const { seen, cell } = mount('es')
    act(() => cell('session').click())
    expect(seen.route).toBe('mode')
  })

  it('draws the bead bands behind the honeycomb', () => {
    const { host } = mount('es')
    expect(host.querySelector('[data-part="bead-bands"]')).not.toBeNull()
  })
})
