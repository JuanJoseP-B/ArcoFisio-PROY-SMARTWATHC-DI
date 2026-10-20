import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import type { Route } from '../navigation/stack'
import { useNav } from '../navigation/useNav'
import { RoutineDetail } from './RoutineDetail'

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

function mount(routineId: string | undefined, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen: { route: Route } = { route: { id: 'routine' } }
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
          {
            initial: {
              stack: [{ id: 'routines' }, { id: 'routine', ...(routineId ? { routineId } : {}) }],
            },
          },
          createElement(RoutineDetail, { routineId }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const pills = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')]
  const press = (index: number) => {
    act(() => pills()[index]?.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }
  const fact = (key: string) => host.querySelector(`[data-fact="${key}"]`)?.textContent
  return { host, seen, part, pills, press, fact }
}

const mine = {
  id: 'user-mine',
  name: { es: 'Mi rutina', en: 'My routine' },
  exercise: 'flexion' as const,
  targetAngle: 135,
  tolerance: 2,
  reps: 6,
  sets: 4,
  restSec: 20,
  builtin: false,
}

describe('RoutineDetail', () => {
  it('shows the name, the exercise with its target, and the counts', () => {
    const { part, fact } = mount('builtin-abduction-120')
    expect(part('detail-name')?.textContent).toBe('Abducción 120°')
    expect(part('detail-target')?.textContent).toBe('Abducción · 120°')
    expect(fact('sets')).toContain('3')
    expect(fact('reps')).toContain('8')
    expect(fact('rest')).toContain('45 s')
  })

  it('speaks English', () => {
    const { part, fact } = mount('builtin-flexion-150', 'en')
    expect(part('detail-name')?.textContent).toBe('Flexion 150°')
    expect(part('detail-target')?.textContent).toBe('Flexion · 150°')
    expect(fact('sets')).toContain('Sets')
  })

  it('starts the routine', () => {
    const { seen, press, pills } = mount('builtin-abduction-90')
    expect(pills().map((b) => b.textContent)).toEqual(['Iniciar'])
    press(0)
    expect(seen.route).toEqual({ id: 'session', routineId: 'builtin-abduction-90' })
  })

  it('does not offer to edit a ready-made routine', () => {
    const { pills } = mount('builtin-flexion-150')
    expect(pills()).toHaveLength(1)
  })

  it('offers to edit the routines the person made', () => {
    getDataLayer().routines.save(mine)
    const { pills, press, seen } = mount('user-mine')
    expect(pills().map((b) => b.textContent)).toEqual(['Iniciar', 'Editar'])
    press(1)
    expect(seen.route).toEqual({ id: 'builder', routineId: 'user-mine' })
  })

  it('warns, instead of the details, when the target is inside the painful arc', () => {
    getDataLayer().painArc.set({ from: 100, to: 130 })
    const { part } = mount('builtin-abduction-120')
    expect(part('detail-warning')?.textContent).toBe('Objetivo dentro del arco doloroso')
    expect(part('detail-target')).toBeNull()
  })

  it('does not warn when the target is outside the painful arc', () => {
    getDataLayer().painArc.set({ from: 60, to: 80 })
    const { part } = mount('builtin-abduction-120')
    expect(part('detail-warning')).toBeNull()
    expect(part('detail-target')).not.toBeNull()
  })

  it('says so, and offers the way back, when the routine is not there', () => {
    const { part, host, seen } = mount('user-gone')
    expect(part('routine-detail')?.dataset.missing).toBe('true')
    expect(host.textContent).toContain('Rutina no encontrada')
    act(() => host.querySelector<HTMLButtonElement>('[data-part="back-button"]')?.click())
    expect(seen.route.id).toBe('routines')
  })

  it('copes with no routine id at all', () => {
    const { part } = mount(undefined)
    expect(part('routine-detail')?.dataset.missing).toBe('true')
  })
})
