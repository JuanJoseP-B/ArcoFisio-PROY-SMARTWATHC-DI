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
import { HISTORY_ROWS, History } from './History'

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

/** Saves a session on the 90° routine, one minute after the one before. */
function save(maxAngle: number, over: Partial<Session> = {}) {
  counter += 1
  const session: Session = {
    id: `s${counter}`,
    routineId: routine.id,
    startedAt: new Date(2026, 9, 3, 10, counter).toISOString(),
    endedAt: new Date(2026, 9, 3, 11, counter).toISOString(),
    maxAngle,
    hits: 1,
    overshoots: 0,
    painEntries: 0,
    reps: [{ peak: maxAngle, held: true }],
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'summary' }, { id: 'history' }] } },
          createElement(History),
          createElement(Spy),
        ),
      ),
    ),
  )
  const rows = () => [...host.querySelectorAll<HTMLElement>('[data-part="history-row"]')]
  const cell = (row: HTMLElement, part: string) =>
    row.querySelector<HTMLElement>(`[data-part="${part}"]`)
  const back = () => host.querySelector<HTMLButtonElement>('[data-part="back-button"]')
  return { host, seen, rows, cell, back }
}

describe('History: with no sessions', () => {
  it('invites the first one', () => {
    const { host, rows } = mount()
    expect(rows()).toHaveLength(0)
    expect(host.querySelector('[data-part="history-empty"]')?.textContent).toBe(
      'Aún no hay sesiones. Haz la primera.',
    )
  })
})

describe('History: the saved sessions', () => {
  it('lists the newest first with the reach, the routine and the date', () => {
    save(80)
    save(90)
    const { rows, cell } = mount()
    expect(rows()).toHaveLength(2)

    const [newest, oldest] = rows() as [HTMLElement, HTMLElement]
    expect(cell(newest, 'history-max')?.textContent).toBe('90°')
    expect(cell(oldest, 'history-max')?.textContent).toBe('80°')
    expect(cell(newest, 'history-routine')?.textContent).toBe('Abducción 90°')
    expect(cell(newest, 'history-date')?.textContent).toMatch(/3 oct/)
    expect(cell(newest, 'history-date')?.textContent).toMatch(/10:02/)
  })

  it('shows the improvement or setback of three sessions in a row, with the right sign', () => {
    save(80)
    save(90)
    save(85)
    const { rows, cell } = mount()
    const changes = rows().map((row) => cell(row, 'history-change'))

    expect(changes[0]?.textContent).toBe('−5°')
    expect(changes[0]?.dataset.trend).toBe('down')
    expect(changes[1]?.textContent).toBe('+10°')
    expect(changes[1]?.dataset.trend).toBe('up')
    expect(changes[2]).toBeNull() // the oldest has nothing before it
  })

  it('shows no sign when the reach did not change', () => {
    save(90)
    save(90)
    const { rows, cell } = mount()
    expect(cell(rows()[0]!, 'history-change')?.textContent).toBe('0°')
    expect(cell(rows()[0]!, 'history-change')?.dataset.trend).toBe('same')
  })

  it('names a routine that no longer exists', () => {
    save(90, { routineId: 'gone' })
    const { rows, cell } = mount()
    expect(cell(rows()[0]!, 'history-routine')?.textContent).toBe('Rutina eliminada')
  })

  it('shows the routine in English', () => {
    save(90)
    const { rows, cell } = mount('en')
    expect(cell(rows()[0]!, 'history-routine')?.textContent).toBe(routine.name.en)
  })

  it('keeps the latest rows only, the last of them still compared with the one just before', () => {
    for (let i = 0; i < HISTORY_ROWS + 3; i += 1) save(50 + i)
    const { rows, cell } = mount()
    expect(rows()).toHaveLength(HISTORY_ROWS)
    expect(cell(rows()[HISTORY_ROWS - 1]!, 'history-change')?.textContent).toBe('+1°')
  })
})

describe('History: navigation', () => {
  it('goes back to the summary', () => {
    const { back, seen } = mount()
    act(() => back()?.click())
    expect(seen.id).toBe('summary')
  })
})
