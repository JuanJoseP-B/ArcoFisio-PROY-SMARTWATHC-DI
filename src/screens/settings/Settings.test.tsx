import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { SEED_ROUTINES } from '../../data/seeds'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Settings } from './Settings'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  localStorage.clear()
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
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function mount(lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
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
        { lang, onLangChange: (next) => getDataLayer().settings.update({ lang: next }) },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'launcher' }, { id: 'settings' }] } },
          createElement(Settings),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const click = (el: Element | null) => act(() => (el as HTMLElement | null)?.click())
  const steppers = () => [...host.querySelectorAll<HTMLElement>('[data-part="stepper"]')]
  const toggles = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="toggle-row"]')]
  const action = (stepper: HTMLElement, name: 'decrease' | 'increase') =>
    stepper.querySelector<HTMLButtonElement>(`[data-action="${name}"]`)
  const value = (stepper: HTMLElement) =>
    stepper.querySelector('[data-part="stepper-value"]')?.textContent
  const pills = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')]
  return { host, seen, part, click, steppers, toggles, action, value, pills }
}

describe('Settings: what it shows', () => {
  it('is named Ajustes and lists the language, sound, vibration and tolerance', () => {
    const { part, steppers, toggles, value } = mount()
    expect(part('settings')?.querySelector('h1')?.textContent).toBe('Ajustes')
    expect(value(steppers()[0]!)).toBe('Español')
    expect(toggles()).toHaveLength(2)
    expect(toggles()[0]?.textContent).toContain('Sonido')
    expect(toggles()[1]?.textContent).toContain('Vibración')
    expect(value(steppers()[1]!)).toBe('±2°')
  })

  it('reads the saved values', () => {
    getDataLayer().settings.update({ sound: false, tolerance: 5 })
    const { toggles, steppers, value } = mount()
    expect(toggles()[0]?.getAttribute('aria-checked')).toBe('false')
    expect(toggles()[0]?.textContent).toContain('Desactivado')
    expect(toggles()[1]?.getAttribute('aria-checked')).toBe('true')
    expect(toggles()[1]?.textContent).toContain('Activado')
    expect(value(steppers()[1]!)).toBe('±5°')
  })

  it('goes back to the launcher', () => {
    const { host, click, seen } = mount()
    click(host.querySelector('[data-part="back-button"]'))
    expect(seen.id).toBe('launcher')
  })
})

describe('Settings: language', () => {
  it('switches the whole screen at once and saves the choice', () => {
    const { part, steppers, action, click, value } = mount()
    click(action(steppers()[0]!, 'increase'))

    expect(part('settings')?.querySelector('h1')?.textContent).toBe('Settings')
    expect(value(steppers()[0]!)).toBe('English')
    expect(getDataLayer().settings.get().lang).toBe('en')

    click(action(steppers()[0]!, 'decrease'))
    expect(part('settings')?.querySelector('h1')?.textContent).toBe('Ajustes')
    expect(getDataLayer().settings.get().lang).toBe('es')
  })

  it('stops at the first language', () => {
    const { steppers, action } = mount()
    expect(action(steppers()[0]!, 'decrease')?.disabled).toBe(true)
  })
})

describe('Settings: sound and vibration', () => {
  it('saves each switch on its own', () => {
    const { toggles, click } = mount()
    click(toggles()[0]!)
    expect(getDataLayer().settings.get()).toMatchObject({ sound: false, vibration: true })
    expect(toggles()[0]?.textContent).toContain('Desactivado')

    click(toggles()[1]!)
    expect(getDataLayer().settings.get()).toMatchObject({ sound: false, vibration: false })

    click(toggles()[0]!)
    expect(getDataLayer().settings.get()).toMatchObject({ sound: true, vibration: false })
  })
})

describe('Settings: tolerance', () => {
  it('moves by half a degree and saves it', () => {
    const { steppers, action, click, value } = mount()
    click(action(steppers()[1]!, 'increase'))
    expect(value(steppers()[1]!)).toBe('±2,5°')
    expect(getDataLayer().settings.get().tolerance).toBe(2.5)

    click(action(steppers()[1]!, 'decrease'))
    click(action(steppers()[1]!, 'decrease'))
    expect(getDataLayer().settings.get().tolerance).toBe(1.5)
  })

  it('writes the decimal point in English', () => {
    getDataLayer().settings.update({ tolerance: 2.5 })
    const { steppers, value } = mount('en')
    expect(value(steppers()[1]!)).toBe('±2.5°')
  })

  it('stops at the lowest tolerance', () => {
    getDataLayer().settings.update({ tolerance: 0.5 })
    const { steppers, action } = mount()
    expect(action(steppers()[1]!, 'decrease')?.disabled).toBe(true)
  })
})

describe('Settings: erasing the data', () => {
  const seed = () => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
    getDataLayer().settings.update({ firstRunDone: true, sound: false })
    getDataLayer().sessions.add({
      id: 's1',
      routineId: SEED_ROUTINES[0]!.id,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      maxAngle: 90,
      hits: 1,
      overshoots: 0,
      painEntries: 0,
      reps: [{ peak: 90, held: true }],
    })
  }

  it('asks a second time before erasing anything', () => {
    seed()
    const { part, pills, click } = mount()
    click(pills()[0]!)
    expect(part('erase-confirm')?.textContent).toContain('¿Borrar todos los datos?')
    expect(getDataLayer().sessions.list()).toHaveLength(1)
  })

  it('changes its mind with Cancelar and keeps everything', () => {
    seed()
    const { part, pills, click } = mount()
    click(pills()[0]!)
    click(pills()[1]!)
    expect(part('erase-confirm')).toBeNull()
    expect(getDataLayer().sessions.list()).toHaveLength(1)
    expect(getDataLayer().painArc.get()).toEqual({ from: 70, to: 110 })
  })

  it('erases the sessions, the painful arc and the settings, and starts over at the intro', () => {
    seed()
    const { pills, click, seen } = mount()
    click(pills()[0]!)
    click(pills()[0]!)
    expect(getDataLayer().sessions.list()).toHaveLength(0)
    expect(getDataLayer().painArc.get()).toBeNull()
    expect(getDataLayer().settings.get()).toMatchObject({ firstRunDone: false, sound: true })
    expect(seen.id).toBe('intro')
  })
})
