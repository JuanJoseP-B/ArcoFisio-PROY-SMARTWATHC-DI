import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { saveConfig } from '../../data/quickConfig'
import type { Exercise } from '../../data/types'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Counts } from './Counts'

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

type Action = 'increase' | 'decrease'

function mount(exercise: Exercise = 'abduction', lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
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
          {
            initial: {
              stack: [
                { id: 'config', exercise },
                { id: 'counts', exercise },
              ],
            },
          },
          createElement(Counts, { exercise }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const stepper = (index: number) =>
    host.querySelectorAll<HTMLElement>('[data-part="stepper"]')[index]!
  const button = (index: number, action: Action) =>
    stepper(index).querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!
  const valueOf = (index: number) =>
    stepper(index).querySelector('[data-part="stepper-value"]')?.textContent
  const tap = (index: number, action: Action) => act(() => button(index, action).click())
  const start = () => {
    act(() => host.querySelector<HTMLButtonElement>('[data-part="pill-button"]')?.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }
  return { host, seen, stepper, button, valueOf, tap, start }
}

describe('Counts', () => {
  it('shows repetitions, sets and rest from the exercise defaults', () => {
    const { stepper, valueOf } = mount('abduction')
    expect([0, 1, 2].map(valueOf)).toEqual(['10', '3', '30 s'])
    expect([0, 1, 2].map((i) => stepper(i).getAttribute('aria-label'))).toEqual([
      'Repeticiones',
      'Series',
      'Descanso',
    ])
  })

  it('speaks English too', () => {
    const { host, stepper, button } = mount('abduction', 'en')
    expect(stepper(0).getAttribute('aria-label')).toBe('Repetitions')
    expect(button(0, 'increase').getAttribute('aria-label')).toBe('Increase: Repetitions')
    expect(host.querySelector('[data-part="pill-button"]')?.textContent).toBe('Start')
  })

  it('names the buttons after what they change', () => {
    const { button } = mount()
    expect(button(1, 'decrease').getAttribute('aria-label')).toBe('Disminuir: Series')
  })

  it('changes the counts one by one and the rest in steps of 5 seconds', () => {
    const { valueOf, tap } = mount()
    tap(0, 'increase')
    tap(1, 'decrease')
    tap(2, 'increase')
    expect([0, 1, 2].map(valueOf)).toEqual(['11', '2', '35 s'])
  })

  it('stops at the limits', () => {
    const { button, valueOf, tap } = mount()
    tap(1, 'decrease')
    tap(1, 'decrease')
    expect(valueOf(1)).toBe('1')
    expect(button(1, 'decrease').disabled).toBe(true)

    for (let i = 0; i < 8; i++) tap(2, 'decrease')
    expect(valueOf(2)).toBe('0 s')
    expect(button(2, 'decrease').disabled).toBe(true)
  })

  it('saves each change in the custom routine of the exercise', () => {
    const { tap } = mount('flexion')
    tap(0, 'decrease')
    tap(2, 'increase')
    expect(getDataLayer().routines.get('user-quick-flexion')).toMatchObject({
      reps: 7,
      restSec: 50,
      exercise: 'flexion',
    })
  })

  it('shows what was configured before', () => {
    saveConfig(getDataLayer(), 'abduction', { target: 100, reps: 4, sets: 6, restSec: 15 })
    const { valueOf } = mount('abduction')
    expect([0, 1, 2].map(valueOf)).toEqual(['4', '6', '15 s'])
  })

  it('starts a session with the custom routine of the exercise', () => {
    const { seen, start } = mount('flexion')
    start()
    expect(seen.id).toBe('session')
    expect(seen.routineId).toBe('user-quick-flexion')
    expect(getDataLayer().routines.get('user-quick-flexion')).not.toBeNull()
  })
})
