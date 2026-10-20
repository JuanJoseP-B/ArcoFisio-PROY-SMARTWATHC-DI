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
import { Summary } from './Summary'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
const routine = SEED_ROUTINES[0]! // Abducción 90°
let counter = 0

beforeEach(() => {
  localStorage.clear()
  counter = 0
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

/** Saves a session after the ones already saved; `when` defaults to now. */
function save(maxAngle: number, over: Partial<Session> = {}) {
  counter += 1
  const started = new Date(Date.now() - (10 - counter) * 60_000)
  const session: Session = {
    id: `s${counter}`,
    routineId: routine.id,
    startedAt: started.toISOString(),
    endedAt: new Date(started.getTime() + 30_000).toISOString(),
    maxAngle,
    hits: 1,
    overshoots: 0,
    painEntries: 0,
    reps: [
      { peak: maxAngle, held: true },
      { peak: maxAngle, held: false },
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'summary' }] } },
          createElement(Summary),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const text = (name: string) => part(name)?.textContent
  const icon = (name: string) => host.querySelector<HTMLButtonElement>(`[data-icon="${name}"]`)
  return { host, seen, part, text, icon, chip: () => part('zone-chip') }
}

describe('Summary: with no sessions', () => {
  it('invites the first session and leaves the target without an arrow', () => {
    const { part, text, icon } = mount()
    expect(part('summary')?.dataset.state).toBe('empty')
    expect(text('summary-empty')).toBe('Aún no hay sesiones. Haz la primera.')
    expect(part('arrow-hit')?.dataset.hit).toBe('false')
    expect(part('arrow')).toBeNull()
    expect(icon('history')).toBeNull()
  })

  it('is named Resumen and still goes back', () => {
    const { part, icon, seen } = mount()
    expect(part('summary')?.querySelector('h1')?.textContent).toBe('Resumen')
    act(() => icon('back')?.click())
    expect(seen.id).toBe('launcher')
  })
})

describe('Summary: the latest session', () => {
  it('shows the best reach, rounded, with the arrow that hits the target', () => {
    save(141.6)
    const { part, text } = mount()
    expect(part('summary')?.dataset.state).toBe('session')
    expect(text('summary-max')).toBe('142°')
    expect(part('arrow-hit')?.dataset.hit).toBe('true')
    expect(part('arrow')).not.toBeNull()
  })

  it('says "de hoy" for a session of today and names it the last one otherwise', () => {
    save(90)
    expect(mount().text('summary-label')).toBe('Rango máximo de hoy')

    document.body.innerHTML = ''
    localStorage.clear()
    save(90, { startedAt: new Date(2026, 0, 3, 10).toISOString() })
    expect(mount().text('summary-label')).toBe('Rango máximo de la última sesión')
  })

  it('counts the repetitions that were held', () => {
    save(90)
    expect(mount().text('summary-held')).toBe('Sostenidas: 1 de 2')
  })

  it('marks the first session on record instead of comparing', () => {
    save(90)
    const { chip } = mount()
    expect(chip()?.textContent).toBe('Primera sesión registrada')
    expect(chip()?.dataset.zone).toBe('far')
  })
})

describe('Summary: the change against the session before', () => {
  it('shows a gain with a plus sign', () => {
    save(130)
    save(142)
    const { chip } = mount()
    expect(chip()?.textContent).toBe('+12° vs. sesión anterior')
    expect(chip()?.dataset.zone).toBe('target')
  })

  it('shows a setback with a minus sign', () => {
    save(97)
    save(90)
    const { chip } = mount()
    expect(chip()?.textContent).toBe('−7° vs. sesión anterior')
    expect(chip()?.dataset.zone).toBe('approach')
  })

  it('shows no sign when the reach is the same', () => {
    save(90)
    save(90)
    const { chip } = mount()
    expect(chip()?.textContent).toBe('0° vs. sesión anterior')
    expect(chip()?.dataset.zone).toBe('far')
  })

  it('after three sessions compares only the last two: an improvement', () => {
    save(80)
    save(90)
    save(100)
    expect(mount().chip()?.textContent).toBe('+10° vs. sesión anterior')
  })

  it('after three sessions compares only the last two: a setback', () => {
    save(80)
    save(100)
    save(95)
    expect(mount().chip()?.textContent).toBe('−5° vs. sesión anterior')
  })

  it('speaks English', () => {
    save(130)
    save(142)
    const { chip, text } = mount('en')
    expect(chip()?.textContent).toBe('+12° vs. previous session')
    expect(text('summary-label')).toBe('Max range today')
    expect(text('summary-held')).toBe('Held: 1 of 2')
  })
})

describe('Summary: navigation', () => {
  it('opens the history', () => {
    save(90)
    const { icon, seen } = mount()
    act(() => icon('history')?.click())
    expect(seen.id).toBe('history')
  })

  it('goes back to the launcher', () => {
    save(90)
    const { icon, seen } = mount()
    act(() => icon('back')?.click())
    expect(seen.id).toBe('launcher')
  })
})
