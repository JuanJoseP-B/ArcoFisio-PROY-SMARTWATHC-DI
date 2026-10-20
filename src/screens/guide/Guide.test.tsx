import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { SEED_ROUTINES } from '../../data/seeds'
import type { Session } from '../../data/types'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Guide } from './Guide'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
const routine = SEED_ROUTINES[0]! // Abducción 90°

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

let counter = 0

/** A clean session on the 90° routine, with whatever the test wants to change. */
function save(over: Partial<Session> = {}) {
  counter += 1
  const session: Session = {
    id: `s${counter}`,
    routineId: routine.id,
    startedAt: new Date(2026, 9, counter, 10).toISOString(),
    endedAt: new Date(2026, 9, counter, 10, 5).toISOString(),
    maxAngle: 90,
    hits: 2,
    overshoots: 0,
    painEntries: 0,
    reps: [
      { peak: 90, held: true },
      { peak: 91, held: true },
    ],
    ...over,
  }
  expect(getDataLayer().sessions.add(session)).toBe(true)
}

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
        { lang },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'launcher' }, { id: 'guide' }] } },
          createElement(Guide),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const text = (name: string) => part(name)?.textContent
  const icon = (name: string) => host.querySelector<HTMLButtonElement>(`[data-icon="${name}"]`)
  return { host, seen, part, text, icon }
}

describe('Guide: with no saved data', () => {
  it('invites the first session and asks to mark the painful arc', () => {
    const { text, part, icon } = mount()
    expect(text('guide-tip')).toBe('Haz tu primera sesión y aquí verás consejos según tus datos.')
    expect(text('guide-counter')).toBe('1 de 2')
    expect(part('guide')?.dataset.tip).toBe('first')

    act(() => icon('next')?.click())
    expect(text('guide-tip')).toBe('Marca tu arco doloroso en Dolor para que el reloj te avise.')
    expect(text('guide-counter')).toBe('2 de 2')
  })

  it('goes round to the first tip after the last one', () => {
    const { text, icon } = mount()
    act(() => icon('next')?.click())
    act(() => icon('next')?.click())
    expect(text('guide-counter')).toBe('1 de 2')
  })

  it('is named Guía IA', () => {
    expect(mount().text('guide')).toContain('Guía IA')
  })
})

describe('Guide: it changes its advice with the saved data', () => {
  beforeEach(() => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
  })

  it('congratulates a clean session', () => {
    save()
    const { text, part } = mount()
    expect(part('guide')?.dataset.tip).toBe('steady')
    expect(text('guide-tip')).toBe('Buena sesión: todo sostenido, sin pasarte y sin dolor.')
  })

  it('warns about pain, with the count in the right plural form', () => {
    save({ painEntries: 1 })
    expect(mount().text('guide-tip')).toBe(
      'Entraste 1 vez al arco doloroso. Pasa más despacio por ahí.',
    )

    document.body.innerHTML = ''
    save({ painEntries: 3 })
    expect(mount().text('guide-tip')).toBe(
      'Entraste 3 veces al arco doloroso. Pasa más despacio por ahí.',
    )
  })

  it('shows a warning with its word on the chip, never color alone', () => {
    save({ painEntries: 2 })
    const { host } = mount()
    expect(host.querySelector('[data-part="zone-chip"]')?.textContent).toBe('Atención')
  })

  it('reads the range change against the session before', () => {
    save({ maxAngle: 90 })
    save({ maxAngle: 96 })
    expect(mount().text('guide-tip')).toBe('Tu rango subió 6° desde la sesión anterior.')
  })

  it('says the range dropped when it did', () => {
    save({ maxAngle: 100 })
    save({ maxAngle: 92 })
    const { text, part } = mount()
    expect(part('guide')?.dataset.tip).toBe('declined')
    expect(text('guide-tip')).toBe('Tu rango bajó 8°. Descansa y no fuerces.')
  })

  it('stops warning about pain once the painful arc is cleared and the sessions are clean', () => {
    save()
    getDataLayer().painArc.set(null)
    const { text, icon } = mount()
    expect(text('guide-counter')).toBe('1 de 2')
    act(() => icon('next')?.click())
    expect(text('guide-tip')).toContain('Marca tu arco doloroso')
  })
})

describe('Guide: navigation and language', () => {
  it('goes back to the launcher', () => {
    const { icon, seen } = mount()
    act(() => icon('back')?.click())
    expect(seen.id).toBe('launcher')
  })

  it('has no next button when there is a single tip', () => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
    save()
    const { icon, text } = mount()
    expect(icon('next')).toBeNull()
    expect(text('guide-counter')).toBe('1 de 1')
  })

  it('speaks English', () => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
    save({ painEntries: 2 })
    const { text, host } = mount('en')
    expect(text('guide-tip')).toBe(
      'You entered the painful arc 2 times. Move through it more slowly.',
    )
    expect(host.querySelector('[data-part="zone-chip"]')?.textContent).toBe('Heads up')
  })
})
