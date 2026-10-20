import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { createCalibrationRepo } from '../data/calibrationRepo'
import { createStorage } from '../data/storage'
import { FakeStorage } from '../data/testStorage'
import { createSensorKit } from '../sensors/kit'
import { I18nProvider } from './I18nProvider'
import { SimulatorPanel } from './SimulatorPanel'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const store = () => createCalibrationRepo(createStorage(new FakeStorage()))

function mount(kit: ReturnType<typeof createSensorKit>, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  const root = createRoot(host)
  act(() =>
    root.render(createElement(I18nProvider, { lang }, createElement(SimulatorPanel, { kit }))),
  )
  return { host, root }
}

function drag(input: HTMLInputElement, value: number) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  act(() => {
    setter?.call(input, String(value))
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('SimulatorPanel', () => {
  it('drives the simulated angle from the slider', () => {
    const kit = createSensorKit('sim', store())
    const { host, root } = mount(kit)
    const slider = host.querySelector('input')!

    expect(slider.min).toBe('0')
    expect(slider.max).toBe('180')
    drag(slider, 120)

    expect(kit.simulated?.currentAngle).toBe(120)
    expect(host.textContent).toContain('120°')
    act(() => root.unmount())
  })

  it('labels the slider in the current language', () => {
    const kit = createSensorKit('sim', store())
    const es = mount(kit, 'es')
    expect(es.host.querySelector('input')?.getAttribute('aria-label')).toBe('Ángulo simulado')
    const en = mount(kit, 'en')
    expect(en.host.querySelector('input')?.getAttribute('aria-label')).toBe('Simulated angle')
    act(() => {
      es.root.unmount()
      en.root.unmount()
    })
  })

  it('renders nothing when the kit is not a simulator', () => {
    const kit = createSensorKit('device', store())
    const { host, root } = mount(kit)
    expect(host.querySelector('[data-part="simulator-panel"]')).toBeNull()
    act(() => root.unmount())
  })
})
