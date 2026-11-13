import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoundStepper } from './RoundStepper'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
})

interface Options {
  start: number
  min?: number
  max?: number
  step?: number
}

function Harness({ start, min = 0, max = 180, step = 5 }: Options) {
  const [value, setValue] = useState(start)
  return createElement(RoundStepper, {
    label: 'Ángulo objetivo',
    value,
    min,
    max,
    step,
    valueText: `${value}°`,
    decreaseLabel: 'Bajar 5 grados',
    increaseLabel: 'Subir 5 grados',
    onChange: setValue,
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
  return { host, button, value }
}

const pointer = (el: Element, type: string) =>
  act(() => {
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 }))
  })

describe('RoundStepper', () => {
  it('names the group, the buttons and shows the value as text', () => {
    const { host, button, value } = mount({ start: 90 })
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Ángulo objetivo')
    expect(button('decrease').getAttribute('aria-label')).toBe('Bajar 5 grados')
    expect(button('increase').getAttribute('aria-label')).toBe('Subir 5 grados')
    expect(value()).toBe('90°')
  })

  it('steps by 5 with the buttons', () => {
    const { button, value } = mount({ start: 90 })
    act(() => button('increase').click())
    expect(value()).toBe('95°')
    act(() => button('decrease').click())
    act(() => button('decrease').click())
    expect(value()).toBe('85°')
  })

  it('stops at both ends of the scale and disables the button there', () => {
    const { button, value } = mount({ start: 0 })
    expect(button('decrease').disabled).toBe(true)
    act(() => button('increase').click())
    expect(value()).toBe('5°')
    const top = mount({ start: 180 })
    expect(top.button('increase').disabled).toBe(true)
  })

  it('steps with the arrow keys from either button', () => {
    const { button, value } = mount({ start: 90 })
    const key = (name: string) =>
      act(() => {
        button('increase').dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))
      })
    key('ArrowUp')
    key('ArrowRight')
    expect(value()).toBe('100°')
    key('ArrowDown')
    key('ArrowLeft')
    key('ArrowLeft')
    expect(value()).toBe('85°')
    key('Enter')
    expect(value()).toBe('85°')
  })

  it('keeps stepping while a button is held, and stops when it is released', () => {
    const { button, value } = mount({ start: 90 })
    pointer(button('increase'), 'pointerdown')
    act(() => {
      vi.advanceTimersByTime(450)
    })
    expect(value()).toBe('95°')
    act(() => {
      vi.advanceTimersByTime(220)
    })
    expect(value()).toBe('105°')
    pointer(button('increase'), 'pointerup')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(value()).toBe('105°')
    // The click that ends a hold does not add one more step.
    act(() => button('increase').click())
    expect(value()).toBe('105°')
    act(() => button('increase').click())
    expect(value()).toBe('110°')
  })

  it('does not repeat before the hold delay and clears its timer on unmount', () => {
    const { button, value } = mount({ start: 90 })
    pointer(button('increase'), 'pointerdown')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(value()).toBe('90°')
    act(() => roots.splice(0).forEach((root) => root.unmount()))
    expect(vi.getTimerCount()).toBe(0)
  })
})
