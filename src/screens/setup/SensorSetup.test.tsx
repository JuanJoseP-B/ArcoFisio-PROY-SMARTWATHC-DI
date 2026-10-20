import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import { createCalibrationRepo } from '../../data/calibrationRepo'
import { createStorage } from '../../data/storage'
import { FakeStorage } from '../../data/testStorage'
import { createSensorKit } from '../../sensors/kit'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import type { NavState } from '../navigation/stack'
import { useNav } from '../navigation/useNav'
import { SensorSetup } from './SensorSetup'

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

type Kit = ReturnType<typeof createSensorKit>

const newKit = (): Kit =>
  createSensorKit('sim', createCalibrationRepo(createStorage(new FakeStorage())))

const FIRST_RUN: NavState = { stack: [{ id: 'language' }, { id: 'setup' }] }

function mount(kit: Kit, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen = { stack: [] as string[], current: '' }
  function Spy() {
    const nav = useNav()
    seen.current = nav.route.id
    seen.stack = [nav.route.id]
    // Going back must stay possible only if something is left under the screen on show.
    seen.stack.push(nav.canGoBack ? 'can-go-back' : 'at-bottom')
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
          { initial: FIRST_RUN },
          createElement(SensorSetup, { kit }),
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
  return { host, seen, part, pills, press }
}

describe('SensorSetup', () => {
  it('steps through the arm-down reading and lets the person skip', () => {
    const kit = newKit()
    kit.tracker.setCalibration(null)
    const { part, pills } = mount(kit)
    expect(part('sensor-steps')?.dataset.step).toBe('calibrate')
    expect(pills().map((b) => b.textContent)).toEqual(['Brazo abajo', 'Omitir'])
  })

  it('has a back button to the language', () => {
    const kit = newKit()
    kit.tracker.setCalibration(null)
    const { host, seen } = mount(kit)
    act(() => host.querySelector<HTMLButtonElement>('[data-part="back-button"]')?.click())
    expect(seen.current).toBe('language')
  })

  it('skipping finishes the first run and opens the launcher over the face', () => {
    const kit = newKit()
    kit.tracker.setCalibration(null)
    const { seen, press } = mount(kit)
    expect(getDataLayer().settings.get().firstRunDone).toBe(false)

    press(1)
    expect(getDataLayer().settings.get().firstRunDone).toBe(true)
    expect(seen.current).toBe('launcher')
    expect(seen.stack).toEqual(['launcher', 'can-go-back'])
  })

  it('says the sensor is ready when the angle is already live, and continues', () => {
    const { part, pills, press, seen } = mount(newKit())
    expect(part('setup-ready')?.textContent).toBe('Sensor listo')
    expect(pills().map((b) => b.textContent)).toEqual(['Continuar'])

    press(0)
    expect(getDataLayer().settings.get().firstRunDone).toBe(true)
    expect(seen.current).toBe('launcher')
  })

  it('speaks English', () => {
    const { part, pills } = mount(newKit(), 'en')
    expect(part('setup-ready')?.textContent).toBe('Sensor ready')
    expect(pills()[0]?.textContent).toBe('Continue')
  })
})
