import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Placeholder } from './Placeholder'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(lang: 'es' | 'en') {
  const host = document.createElement('div')
  const seen = { id: '' }
  function Spy() {
    seen.id = useNav().route.id
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'pain' }] } },
          createElement(Placeholder, { title: 'launcher.pain' }),
          createElement(Spy),
        ),
      ),
    ),
  )
  return { host, seen }
}

describe('Placeholder', () => {
  it('shows the app name and a coming-soon note in both languages', () => {
    const es = mount('es').host
    expect(es.querySelector('h1')?.textContent).toBe('Dolor')
    expect(es.textContent).toContain('Próximamente')

    const en = mount('en').host
    expect(en.querySelector('h1')?.textContent).toBe('Pain')
    expect(en.textContent).toContain('Coming soon')
  })

  it('never traps the person: the back button returns to the launcher', () => {
    const { host, seen } = mount('es')
    expect(seen.id).toBe('pain')
    const back = host.querySelector<HTMLButtonElement>('[data-part="back-button"]')
    expect(back?.getAttribute('aria-label')).toBe('Atrás')
    act(() => back?.click())
    expect(seen.id).toBe('launcher')
  })
})
