import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

interface Options {
  start: number
  min?: number
  max?: number
  step?: number
  spy?: (value: number) => void
}

function Harness({ start, min = 1, max = 5, step = 1, spy }: Options) {
  const [value, setValue] = useState(start)
  return createElement(Stepper, {
    label: 'Series',
    valueText: `${value} s`,
    value,
    min,
    max,
    step,
    decreaseLabel: 'Disminuir Series',
    increaseLabel: 'Aumentar Series',
    onChange: (next: number) => {
      spy?.(next)
      setValue(next)
    },
  })
}

function mount(options: Options) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(Harness, options)))
  const button = (action: 'decrease' | 'increase') =>
    host.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!
  const value = () => host.querySelector('[data-part="stepper-value"]')?.textContent
  const click = (action: 'decrease' | 'increase') => act(() => button(action).click())
  return { host, button, value, click }
}

describe('Stepper', () => {
  it('names the group and both buttons and shows the value', () => {
    const { host, button, value } = mount({ start: 3 })
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Series')
    expect(button('decrease').getAttribute('aria-label')).toBe('Disminuir Series')
    expect(button('increase').getAttribute('aria-label')).toBe('Aumentar Series')
    expect(value()).toBe('3 s')
    expect(host.textContent).toContain('Series')
  })

  it('moves by the step in both directions', () => {
    const { click, value } = mount({ start: 20, min: 0, max: 600, step: 5 })
    click('increase')
    expect(value()).toBe('25 s')
    click('decrease')
    click('decrease')
    expect(value()).toBe('15 s')
  })

  it('disables the button at each end so it cannot go past', () => {
    const spy = vi.fn()
    const { button, click, value } = mount({ start: 1, spy })
    expect(button('decrease').disabled).toBe(true)
    click('decrease')
    expect(spy).not.toHaveBeenCalled()

    click('increase')
    click('increase')
    click('increase')
    click('increase')
    expect(value()).toBe('5 s')
    expect(button('increase').disabled).toBe(true)
  })

  it('lands on the limit when a step would overshoot it', () => {
    const { click, value } = mount({ start: 3, min: 0, max: 4, step: 5 })
    click('increase')
    expect(value()).toBe('4 s')
    click('decrease')
    expect(value()).toBe('0 s')
  })
})
