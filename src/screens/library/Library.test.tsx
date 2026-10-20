import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { quickRoutineId } from '../../data/quickConfig'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Library } from './Library'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function mount(lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen = { route: { id: '' } as { id: string; routineId?: string } }
  function Spy() {
    seen.route = useNav().route
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'routines' }] } },
          createElement(Library),
          createElement(Spy),
        ),
      ),
    ),
  )
  const cards = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="routine-card"]')]
  const titles = () => cards().map((c) => c.querySelector('[data-part="card-title"]')?.textContent)
  return { host, seen, cards, titles }
}

describe('Library', () => {
  it('lists the ready-made routines after a card to make a new one', () => {
    const { host, titles } = mount()
    expect(host.querySelector('h1')?.textContent).toBe('Rutinas')
    expect(titles()).toEqual([
      'Nueva rutina',
      'Abducción 90°',
      'Abducción 120°',
      'Flexión 150°',
      'Elevación asistida 60°',
    ])
  })

  it('says sets, repetitions and target on each card', () => {
    const { cards } = mount()
    const subtitle = (index: number) =>
      cards()[index]?.querySelector('[data-part="card-subtitle"]')?.textContent
    expect(subtitle(1)).toBe('3×10 · 90°')
    expect(subtitle(4)).toBe('2×12 · 60°')
    expect(subtitle(0)).toBeUndefined()
  })

  it('fills each thumbnail by the share of the 180 degrees the target reaches', () => {
    const { cards } = mount()
    const offset = (index: number) =>
      Number(
        cards()[index]?.querySelector('[data-part="card-fill"]')?.getAttribute('stroke-dashoffset'),
      )
    expect(offset(1)).toBeCloseTo(31.5, 1)
    expect(offset(2)).toBeCloseTo(21, 1)
  })

  it('shows the names in English', () => {
    const { titles } = mount('en')
    expect(titles()).toEqual([
      'New routine',
      'Abduction 90°',
      'Abduction 120°',
      'Flexion 150°',
      'Assisted elevation 60°',
    ])
  })

  it('lists the routines the person made after the ready-made ones', () => {
    getDataLayer().routines.save({
      id: 'user-mine',
      name: { es: 'Mi rutina', en: 'My routine' },
      exercise: 'flexion',
      targetAngle: 135,
      tolerance: 2,
      reps: 6,
      sets: 4,
      restSec: 20,
      builtin: false,
    })
    const { titles } = mount()
    expect(titles().at(-1)).toBe('Mi rutina')
  })

  it('includes the routine saved from the quick configuration', () => {
    const data = getDataLayer()
    data.routines.save({
      id: quickRoutineId('abduction'),
      name: { es: 'Abducción personalizada', en: 'Custom abduction' },
      exercise: 'abduction',
      targetAngle: 105,
      tolerance: 2,
      reps: 5,
      sets: 2,
      restSec: 15,
      builtin: false,
    })
    expect(mount().titles()).toContain('Abducción personalizada')
  })

  it('opens the builder from the first card', () => {
    const { cards, seen } = mount()
    act(() => cards()[0]?.click())
    expect(seen.route.id).toBe('builder')
    expect(seen.route.routineId).toBeUndefined()
  })

  it('opens the detail of the routine that is pressed', () => {
    const { cards, seen } = mount()
    act(() => cards()[3]?.click())
    expect(seen.route).toMatchObject({ id: 'routine', routineId: 'builtin-flexion-150' })
  })

  it('has a back button above the list', () => {
    const { host, seen } = mount()
    const back = host.querySelector<HTMLButtonElement>('[data-part="back-button"]')
    expect(back).not.toBeNull()
    expect(host.querySelector('[data-part="library"]')?.lastElementChild).toBe(back)
    act(() => back?.click())
    expect(seen.route.id).toBe('launcher')
  })
})
