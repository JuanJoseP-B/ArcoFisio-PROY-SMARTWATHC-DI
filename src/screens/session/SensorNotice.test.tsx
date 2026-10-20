import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import type { Notice } from './noticeFor'
import { SensorNotice } from './SensorNotice'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const html = (notice: Notice, lang: 'es' | 'en', onMeasure?: () => void) =>
  renderToString(
    <I18nProvider lang={lang}>
      <SensorNotice notice={notice} {...(onMeasure ? { onMeasure } : {})} />
    </I18nProvider>,
  )

function mount(notice: Notice, onMeasure: () => void) {
  const host = document.createElement('div')
  const root = createRoot(host)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang: 'es' },
        createElement(SensorNotice, { notice, onMeasure }),
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

  it('shows no button when there is nothing the person can do', () => {
    const notice: Notice = { message: 'sensor.paused', action: null, simHint: false }
    expect(html(notice, 'es', () => undefined)).not.toContain('<button')
  })

  it('shows no button when there is nowhere to send the person', () => {
    const notice: Notice = { message: 'sensor.noData', action: 'enable', simHint: false }
    expect(html(notice, 'es')).not.toContain('<button')
  })

  it.each([
    ['enable', 'sensor.noData'],
    ['calibrate', 'sensor.uncalibrated'],
  ] as const)('opens Measure from the button when the action is %s', (action, message) => {
    const onMeasure = vi.fn()
    const { host, root } = mount({ message, action, simHint: false }, onMeasure)
    const button = host.querySelector('button')
    expect(button?.textContent).toBe('Medir')
    act(() => button?.click())
    expect(onMeasure).toHaveBeenCalledTimes(1)
    act(() => root.unmount())
  })
})
