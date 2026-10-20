import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import type { AngleActions } from '../../app/useAngle'
import type { Notice } from './noticeFor'
import { SensorNotice } from './SensorNotice'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const actions = (): AngleActions => ({
  requestPermission: vi.fn(() => Promise.resolve('granted' as const)),
  calibrate: vi.fn(() => Promise.resolve({ ok: true as const, gravityRef: [0, 0, 1] as const })),
})

const html = (notice: Notice, lang: 'es' | 'en') =>
  renderToString(
    <I18nProvider lang={lang}>
      <SensorNotice notice={notice} actions={actions()} />
    </I18nProvider>,
  )

function mount(notice: Notice, a: AngleActions) {
  const host = document.createElement('div')
  const root = createRoot(host)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang: 'es' },
        createElement(SensorNotice, { notice, actions: a }),
      ),
    ),
  )
  return { host, root }
}

describe('SensorNotice', () => {
  it('writes the message in both languages', () => {
    const notice: Notice = { message: 'sensor.noData', action: null, simHint: false }
    expect(html(notice, 'es')).toContain('Sin datos del sensor')
    expect(html(notice, 'en')).toContain('No sensor data')
  })

  it('adds the simulator hint only when asked', () => {
    const base: Notice = { message: 'sensor.denied', action: null, simHint: false }
    expect(html(base, 'en')).not.toContain('?sim=1')
    expect(html({ ...base, simHint: true }, 'en')).toContain('?sim=1')
  })

  it('shows no button when there is no action', () => {
    expect(html({ message: 'sensor.paused', action: null, simHint: false }, 'es')).not.toContain(
      '<button',
    )
  })

  it('requests sensor access from the enable button tap', () => {
    const a = actions()
    const { host, root } = mount({ message: 'sensor.noData', action: 'enable', simHint: false }, a)
    const button = host.querySelector('button')
    expect(button?.textContent).toBe('Activar sensor')
    act(() => button?.click())
    expect(a.requestPermission).toHaveBeenCalledTimes(1)
    expect(a.calibrate).not.toHaveBeenCalled()
    act(() => root.unmount())
  })

  it('starts the arm-down calibration from the calibrate button', () => {
    const a = actions()
    const { host, root } = mount(
      { message: 'sensor.uncalibrated', action: 'calibrate', simHint: false },
      a,
    )
    const button = host.querySelector('button')
    expect(button?.textContent).toBe('Brazo abajo')
    act(() => button?.click())
    expect(a.calibrate).toHaveBeenCalledTimes(1)
    act(() => root.unmount())
  })
})
