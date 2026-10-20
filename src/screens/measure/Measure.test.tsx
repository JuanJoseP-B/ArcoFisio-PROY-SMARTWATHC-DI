import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { createCalibrationRepo } from '../../data/calibrationRepo'
import { createStorage } from '../../data/storage'
import { FakeStorage } from '../../data/testStorage'
import { createSensorKit } from '../../sensors/kit'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Measure } from './Measure'

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

/** A simulated kit that has not been calibrated yet: samples arrive, there is no reference. */
function uncalibratedKit(): Kit {
  const kit = newKit()
  kit.tracker.setCalibration(null)
  return kit
}

function mount(kit: Kit, lang: 'es' | 'en' = 'es') {
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'measure' }] } },
          createElement(Measure, { kit }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const text = (name: string) => part(name)?.textContent
  const icon = (name: string) => host.querySelector<HTMLButtonElement>(`[data-icon="${name}"]`)!
  const move = (angle: number) =>
    act(() => {
      for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(angle)
    })
  return { host, seen, part, text, icon, move }
}

describe('Measure: getting the sensor ready', () => {
  it('asks for the arm down while there is a reading but no reference', () => {
    const { part, text, host } = mount(uncalibratedKit())
    expect(part('measure')?.dataset.mode).toBe('steps')
    expect(part('sensor-steps')?.dataset.step).toBe('calibrate')
    expect(text('sensor-message')).toBe('Deja el brazo colgando y quieto')
    expect(host.querySelector('[data-part="back-button"]')).not.toBeNull()
  })

  it('goes to the live range once the arm-down reading is saved', async () => {
    const kit = uncalibratedKit()
    const { part, host } = mount(kit)

    act(() => host.querySelector<HTMLButtonElement>('[data-part="pill-button"]')?.click())
    await act(async () => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
      await Promise.resolve()
    })
    expect(part('sensor-message')?.textContent).toBe('Midiendo… no te muevas')

    await act(async () => {
      for (let i = 0; i < 25; i += 1) kit.simulated?.setAngle(0)
      await Promise.resolve()
    })
    expect(part('measure')?.dataset.mode).toBe('range')
  })

  it('has a back button while it is still getting ready', () => {
    const { host, seen } = mount(uncalibratedKit())
    act(() => host.querySelector<HTMLButtonElement>('[data-part="back-button"]')?.click())
    expect(seen.id).toBe('launcher')
  })
})

describe('Measure: the live range', () => {
  it('shows the angle and the ring', () => {
    const { part, text, move, host } = mount(newKit())
    expect(part('measure')?.dataset.mode).toBe('range')
    move(90)
    expect(text('angle')).toBe('90°')
    expect(host.querySelector('[data-part="goniometer-ring"]')).not.toBeNull()
    expect(text('measure-note')).toBe('Máximo 90°')
  })

  it('keeps the largest angle reached while the arm comes back down', () => {
    const { text, move } = mount(newKit())
    move(120)
    move(60)
    expect(text('angle')).toBe('60°')
    expect(text('measure-note')).toBe('Máximo 120°')
  })

  it('resets the maximum to where the arm is now', () => {
    const { text, move, icon } = mount(newKit())
    move(120)
    move(60)
    act(() => icon('reset').click())
    expect(text('measure-note')).toBe('Máximo 60°')
  })

  it('has labelled buttons for back, reset and calibrate again', () => {
    const { icon } = mount(newKit())
    expect(icon('back').getAttribute('aria-label')).toBe('Atrás')
    expect(icon('reset').getAttribute('aria-label')).toBe('Reiniciar máximo')
    expect(icon('calibrate').getAttribute('aria-label')).toBe('Calibrar de nuevo')
  })

  it('goes back from the range view too', () => {
    const { icon, seen } = mount(newKit())
    act(() => icon('back').click())
    expect(seen.id).toBe('launcher')
  })

  it('calibrates again, tells the person to hold still, and clears the maximum', async () => {
    const kit = newKit()
    const { text, move, icon } = mount(kit)
    move(120)
    expect(text('measure-note')).toBe('Máximo 120°')

    act(() => icon('calibrate').click())
    expect(text('measure-note')).toBe('Midiendo… no te muevas')
    expect(icon('reset').disabled).toBe(true)
    expect(icon('calibrate').disabled).toBe(true)

    await act(async () => {
      for (let i = 0; i < 25; i += 1) kit.simulated?.setAngle(120)
      await Promise.resolve()
    })
    expect(icon('calibrate').disabled).toBe(false)
    expect(text('angle')).toBe('0°')
    expect(text('measure-note')).toBe('Máximo 0°')
  })

  it('speaks English', () => {
    const { text, icon, move } = mount(newKit(), 'en')
    move(45)
    expect(text('measure-note')).toBe('Maximum 45°')
    expect(icon('reset').getAttribute('aria-label')).toBe('Reset maximum')
  })
})
