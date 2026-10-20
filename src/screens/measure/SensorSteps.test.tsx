import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import type { AngleActions } from '../../app/useAngle'
import type { CalibrationResult } from '../../sensors/calibration'
import type { TrackerStatus } from '../../sensors/tracker'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { SensorSteps } from './SensorSteps'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
const OK: CalibrationResult = { ok: true, gravityRef: [0, 0, 1] }

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
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Actions whose calibration answers with `result`, or waits for `finish` when none is given. */
function fakeActions(result?: CalibrationResult) {
  let finish: (value: CalibrationResult) => void = () => undefined
  const pending = new Promise<CalibrationResult>((resolve) => {
    finish = resolve
  })
  const actions: AngleActions = {
    requestPermission: vi.fn(() => Promise.resolve('granted' as const)),
    calibrate: vi.fn(() => (result ? Promise.resolve(result) : pending)),
  }
  return { actions, finish }
}

function mount(
  status: TrackerStatus,
  actions: AngleActions,
  options: { onSkip?: () => void; lang?: 'es' | 'en' } = {},
) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang: options.lang ?? 'es' },
        createElement(SensorSteps, {
          status,
          actions,
          ...(options.onSkip ? { onSkip: options.onSkip } : {}),
        }),
      ),
    ),
  )
  const message = () => host.querySelector('[data-part="sensor-message"]')?.textContent
  const pills = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')]
  const labels = () => pills().map((button) => button.textContent)
  const press = async () => {
    act(() => pills()[0]?.click())
    await act(async () => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
      await Promise.resolve()
    })
  }
  return { host, message, pills, labels, press, root }
}

describe('SensorSteps', () => {
  it('asks to turn the sensor on, and presses at once so iOS sees the tap', () => {
    const { actions } = fakeActions()
    const { message, pills, labels } = mount('waiting', actions)
    expect(message()).toBe('Activa el sensor de movimiento')
    expect(labels()).toEqual(['Activar sensor'])
    expect(pills()[0]?.dataset.variant).toBe('secondary')

    act(() => pills()[0]?.click())
    expect(actions.requestPermission).toHaveBeenCalledTimes(1)
  })

  it('says there is no data and suggests the simulator', () => {
    const { host, message } = mount('no-data', fakeActions().actions)
    expect(message()).toBe('Sin datos del sensor')
    expect(host.textContent).toContain('?sim=1')
  })

  it('explains a refusal and offers no button', () => {
    const { host, message, pills } = mount('denied', fakeActions().actions)
    expect(message()).toBe('Permiso del sensor denegado')
    expect(host.textContent).toContain('?sim=1')
    expect(pills()).toHaveLength(0)
  })

  it('explains a device without a sensor', () => {
    const { message, pills } = mount('unsupported', fakeActions().actions)
    expect(message()).toBe('Este dispositivo no tiene sensor de movimiento')
    expect(pills()).toHaveLength(0)
  })

  it('asks for the arm down and calibrates on press', async () => {
    const { actions } = fakeActions(OK)
    const { message, labels, press } = mount('uncalibrated', actions)
    expect(message()).toBe('Deja el brazo colgando y quieto')
    expect(labels()).toEqual(['Brazo abajo'])

    await press()
    expect(actions.calibrate).toHaveBeenCalledTimes(1)
  })

  it('says to hold still while measuring and hides the button', async () => {
    const { actions, finish } = fakeActions()
    const { message, pills, press } = mount('uncalibrated', actions)
    await press()
    expect(message()).toBe('Midiendo… no te muevas')
    expect(pills()).toHaveLength(0)

    await act(async () => finish(OK))
    expect(actions.calibrate).toHaveBeenCalledTimes(1)
  })

  it('tells the person they moved, and lets them try again', async () => {
    const { actions } = fakeActions({ ok: false, reason: 'unstable' })
    const { message, labels, press } = mount('uncalibrated', actions)
    await press()
    expect(message()).toBe('Te moviste. Inténtalo de nuevo')
    expect(labels()).toEqual(['Brazo abajo'])
  })

  it('tells the person when the sensor gave no readings', async () => {
    const { actions } = fakeActions({ ok: false, reason: 'no-data' })
    const { message, press } = mount('uncalibrated', actions)
    await press()
    expect(message()).toBe('Sin lecturas. Revisa el permiso')
  })

  it('offers to skip only when asked to', () => {
    const onSkip = vi.fn()
    const without = mount('denied', fakeActions().actions)
    expect(without.pills()).toHaveLength(0)

    const withSkip = mount('denied', fakeActions().actions, { onSkip })
    expect(withSkip.labels()).toEqual(['Omitir'])
    act(() => withSkip.pills()[0]?.click())
    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  it('speaks English', () => {
    const { message, labels } = mount('uncalibrated', fakeActions().actions, { lang: 'en' })
    expect(message()).toBe('Let your arm hang still')
    expect(labels()).toEqual(['Arm down'])
  })

  it('does not update after it is gone', async () => {
    const { actions, finish } = fakeActions()
    const { press, root } = mount('uncalibrated', actions)
    await press()
    act(() => root.unmount())
    roots.length = 0
    await act(async () => finish({ ok: false, reason: 'unstable' }))
    expect(actions.calibrate).toHaveBeenCalledTimes(1)
  })
})
