import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { ModeSelect } from './ModeSelect'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  vi.useFakeTimers()
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
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function mount(lang: 'es' | 'en') {
  const host = document.createElement('div')
  const seen = { id: '', routineId: '' as string | undefined }
  function Spy() {
    const { route } = useNav()
    seen.id = route.id
    seen.routineId = route.routineId
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'mode' }] } },
          createElement(ModeSelect),
          createElement(Spy),
        ),
      ),
    ),
  )
  const press = (index: number) => {
    act(() => host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')[index]?.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }
  return { host, seen, press }
}

describe('ModeSelect', () => {
  it('asks for the exercise with two pill buttons, in Spanish', () => {
    const { host } = mount('es')
    expect(host.querySelector('h1')?.textContent).toBe('Ejercicio')
    const labels = [...host.querySelectorAll('[data-part="pill-button"]')].map((b) => b.textContent)
    expect(labels).toEqual(['Abducción', 'Flexión'])
  })

  it('asks for the exercise in English', () => {
    const { host } = mount('en')
    expect(host.querySelector('h1')?.textContent).toBe('Exercise')
    const labels = [...host.querySelectorAll('[data-part="pill-button"]')].map((b) => b.textContent)
    expect(labels).toEqual(['Abduction', 'Flexion'])
  })

  it('starts a session with the abduction routine', () => {
    const { seen, press } = mount('es')
    press(0)
    expect(seen.id).toBe('session')
    expect(seen.routineId).toBe('builtin-abduction-90')
  })

  it('starts a session with the flexion routine', () => {
    const { seen, press } = mount('es')
    press(1)
    expect(seen.id).toBe('session')
    expect(seen.routineId).toBe('builtin-flexion-150')
  })

  it('has a labelled back button that returns to the launcher', () => {
    const { host, seen } = mount('es')
    const back = host.querySelector<HTMLButtonElement>('[data-part="back-button"]')
    expect(back?.getAttribute('aria-label')).toBe('Atrás')
    act(() => back?.click())
    expect(seen.id).toBe('launcher')
  })
})
