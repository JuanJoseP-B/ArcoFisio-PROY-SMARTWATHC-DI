import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import type { Routine } from '../../data/types'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import type { Route } from '../navigation/stack'
import { useNav } from '../navigation/useNav'
import { Builder } from './Builder'

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

function mount(routineId?: string, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen: { route: Route; depth: number } = { route: { id: 'builder' }, depth: 0 }
  function Spy() {
    const nav = useNav()
    seen.route = nav.route
    seen.depth = nav.canGoBack ? 1 : 0
    return null
  }
  const route: Route = { id: 'builder', ...(routineId ? { routineId } : {}) }
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
              stack: [
                { id: 'launcher' },
                { id: 'routines' },
                ...(routineId ? [{ id: 'routine', routineId } as Route] : []),
                route,
              ],
            },
          },
          createElement(Builder, { routineId }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const input = () => part('builder-name') as HTMLInputElement
  const type = (value: string) =>
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setter?.call(input(), value)
      input().dispatchEvent(new Event('input', { bubbles: true }))
    })
  const stepper = (index: number) =>
    host.querySelectorAll<HTMLElement>('[data-part="stepper"]')[index]!
  const stepperValue = (index: number) =>
    stepper(index).querySelector('[data-part="stepper-value"]')?.textContent
  const tap = (index: number, action: 'increase' | 'decrease', times = 1) => {
    for (let i = 0; i < times; i += 1) {
      act(() =>
        stepper(index).querySelector<HTMLButtonElement>(`[data-action="${action}"]`)?.click(),
      )
    }
  }
  const pills = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')]
  const press = (label: string) => {
    act(() =>
      pills()
        .find((b) => b.textContent === label)
        ?.click(),
    )
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }
  return { host, seen, part, input, type, stepperValue, tap, pills, press }
}

const mine: Routine = {
  id: 'user-mine',
  name: { es: 'Mi rutina', en: 'My routine' },
  exercise: 'flexion',
  targetAngle: 135,
  tolerance: 2,
  reps: 6,
  sets: 4,
  restSec: 20,
  builtin: false,
}

const STEPPERS = { exercise: 0, target: 1, reps: 2, sets: 3, rest: 4 }

describe('Builder: a new routine', () => {
  it('starts from sensible values, with the automatic name as the placeholder', () => {
    const { part, input, stepperValue } = mount()
    expect(part('builder')?.dataset.mode).toBe('new')
    expect(part('builder-list')?.querySelector('h1')?.textContent).toBe('Nueva rutina')
    expect(input().value).toBe('')
    expect(input().placeholder).toBe('Abducción 90°')
    expect(stepperValue(STEPPERS.exercise)).toBe('Abducción')
    expect(stepperValue(STEPPERS.target)).toBe('90°')
    expect(stepperValue(STEPPERS.reps)).toBe('10')
    expect(stepperValue(STEPPERS.sets)).toBe('3')
    expect(stepperValue(STEPPERS.rest)).toBe('30 s')
  })

  it('starts from the last target the person chose', () => {
    getDataLayer().settings.update({ targetDefault: 125 })
    expect(mount().stepperValue(STEPPERS.target)).toBe('125°')
  })

  it('changes each value with its stepper, in the steps of the sheet', () => {
    const { tap, stepperValue } = mount()
    tap(STEPPERS.target, 'increase', 2)
    tap(STEPPERS.reps, 'decrease', 3)
    tap(STEPPERS.sets, 'increase')
    tap(STEPPERS.rest, 'increase', 2)
    tap(STEPPERS.exercise, 'increase')

    expect(stepperValue(STEPPERS.target)).toBe('100°')
    expect(stepperValue(STEPPERS.reps)).toBe('7')
    expect(stepperValue(STEPPERS.sets)).toBe('4')
    expect(stepperValue(STEPPERS.rest)).toBe('40 s')
    expect(stepperValue(STEPPERS.exercise)).toBe('Flexión')
  })

  it('updates the automatic name as the exercise and the target change', () => {
    const { input, tap } = mount()
    tap(STEPPERS.exercise, 'increase')
    tap(STEPPERS.target, 'increase')
    expect(input().placeholder).toBe('Flexión 95°')
  })

  it('stops each stepper at its ends', () => {
    const { tap, stepperValue } = mount()
    tap(STEPPERS.target, 'increase', 30)
    expect(stepperValue(STEPPERS.target)).toBe('180°')
    tap(STEPPERS.target, 'decrease', 40)
    expect(stepperValue(STEPPERS.target)).toBe('5°')
    tap(STEPPERS.exercise, 'decrease')
    expect(stepperValue(STEPPERS.exercise)).toBe('Abducción')
  })

  it('limits the name to what the data layer accepts', () => {
    expect(mount().input().maxLength).toBe(60)
  })

  it('saves the routine with the typed name and goes back to the library', () => {
    const { seen, type, tap, press } = mount()
    type('Después del yeso')
    tap(STEPPERS.target, 'increase', 3)
    tap(STEPPERS.sets, 'decrease')
    press('Guardar')

    const saved = getDataLayer()
      .routines.list()
      .filter((r) => !r.builtin)
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      name: { es: 'Después del yeso', en: 'Después del yeso' },
      exercise: 'abduction',
      targetAngle: 105,
      reps: 10,
      sets: 2,
      restSec: 30,
      builtin: false,
    })
    expect(seen.route.id).toBe('routines')
  })

  it('names the routine after its exercise and target when no name is typed', () => {
    const { tap, press } = mount()
    tap(STEPPERS.exercise, 'increase')
    press('Guardar')
    const saved = getDataLayer()
      .routines.list()
      .find((r) => !r.builtin)
    expect(saved?.name).toEqual({ es: 'Flexión 90°', en: 'Flexion 90°' })
  })

  it('keeps the tolerance chosen in the settings', () => {
    getDataLayer().settings.update({ tolerance: 4 })
    const { press } = mount()
    press('Guardar')
    expect(
      getDataLayer()
        .routines.list()
        .find((r) => !r.builtin)?.tolerance,
    ).toBe(4)
  })

  it('offers no delete for a routine that is not saved yet', () => {
    expect(
      mount()
        .pills()
        .map((b) => b.textContent),
    ).toEqual(['Guardar'])
  })

  it('treats a ready-made routine as a new one, since those cannot be edited', () => {
    const { part } = mount('builtin-abduction-90')
    expect(part('builder')?.dataset.mode).toBe('new')
  })

  it('speaks English', () => {
    const { part, input, pills } = mount(undefined, 'en')
    expect(part('builder-list')?.querySelector('h1')?.textContent).toBe('New routine')
    expect(input().placeholder).toBe('Abduction 90°')
    expect(pills().map((b) => b.textContent)).toEqual(['Save'])
  })
})

describe('Builder: editing a routine', () => {
  beforeEach(() => {
    getDataLayer().routines.save(mine)
  })

  it('loads the routine into the fields', () => {
    const { part, input, stepperValue } = mount('user-mine')
    expect(part('builder')?.dataset.mode).toBe('edit')
    expect(part('builder-list')?.querySelector('h1')?.textContent).toBe('Editar rutina')
    expect(input().value).toBe('Mi rutina')
    expect(stepperValue(STEPPERS.exercise)).toBe('Flexión')
    expect(stepperValue(STEPPERS.target)).toBe('135°')
    expect(stepperValue(STEPPERS.reps)).toBe('6')
    expect(stepperValue(STEPPERS.sets)).toBe('4')
    expect(stepperValue(STEPPERS.rest)).toBe('20 s')
  })

  it('saves over the same routine instead of adding another', () => {
    const { tap, press, seen } = mount('user-mine')
    tap(STEPPERS.reps, 'increase', 2)
    press('Guardar')

    const own = getDataLayer()
      .routines.list()
      .filter((r) => !r.builtin)
    expect(own).toHaveLength(1)
    expect(own[0]).toMatchObject({ id: 'user-mine', reps: 8, name: mine.name })
    expect(seen.route.id).toBe('routine')
  })

  it('renames the routine when the name is changed', () => {
    const { type, press } = mount('user-mine')
    type('Mañana')
    press('Guardar')
    expect(getDataLayer().routines.get('user-mine')?.name).toEqual({ es: 'Mañana', en: 'Mañana' })
  })

  it('asks before deleting, and cancelling keeps the routine', () => {
    const { part, press, pills } = mount('user-mine')
    expect(pills().map((b) => b.textContent)).toEqual(['Guardar', 'Eliminar'])

    press('Eliminar')
    expect(part('delete-confirm')?.textContent).toContain('¿Eliminar esta rutina?')
    expect(getDataLayer().routines.get('user-mine')).not.toBeNull()

    press('Cancelar')
    expect(part('delete-confirm')).toBeNull()
    expect(getDataLayer().routines.get('user-mine')).not.toBeNull()
  })

  it('deletes after the confirmation and lands on the library', () => {
    const { press, seen } = mount('user-mine')
    press('Eliminar')
    press('Sí, eliminar')

    expect(getDataLayer().routines.get('user-mine')).toBeNull()
    expect(seen.route.id).toBe('routines')
    expect(seen.depth).toBe(1)
  })
})
