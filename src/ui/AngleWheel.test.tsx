import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AngleWheel } from './AngleWheel'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

const TITLE = 'Ángulo objetivo'
const CAPTION = 'Detenciones cada 5°'

function Harness({ start, spy }: { start: number; spy?: (value: number) => void }) {
  const [value, setValue] = useState(start)
  return createElement(AngleWheel, {
    value,
    title: TITLE,
    caption: CAPTION,
    onChange: (next: number) => {
      spy?.(next)
      setValue(next)
    },
  })
}

function mount(start = 90, spy?: (value: number) => void) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(Harness, { start, ...(spy ? { spy } : {}) })))
  const wheel = host.querySelector<HTMLElement>('[data-part="angle-wheel"]')!
  // jsdom has no layout: put the wheel centre at (0, 0).
  wheel.getBoundingClientRect = () =>
    ({ left: -192, top: -192, width: 384, height: 384 }) as DOMRect
  const value = () => host.querySelector('[data-part="wheel-value"]')?.textContent
  return { host, wheel, value }
}

const key = (el: HTMLElement, name: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))
  })

function pointer(el: HTMLElement, type: string, x: number, y: number) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true })
  Object.defineProperty(event, 'pointerId', { value: 1 })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

describe('AngleWheel', () => {
  it('shows the value, the title and the caption, with 72 marks and 7 degree labels', () => {
    const html = renderToString(createElement(Harness, { start: 90 }))
    expect(html).toContain('90°')
    expect(html).toContain(TITLE)
    expect(html).toContain(CAPTION)
    expect(html.match(/<line/g)?.length).toBe(72 + 1)
    expect(html.match(/<text/g)?.length).toBe(7)
  })

  it('turns the dial against the value', () => {
    const { host } = mount(90)
    const dial = host.querySelector<SVGElement>('[data-part="wheel-dial"]')!
    expect(dial.style.transform).toBe('rotate(-90deg)')
  })

  it('is an accessible slider from 0 to 180', () => {
    const { wheel } = mount(120)
    expect(wheel.getAttribute('role')).toBe('slider')
    expect(wheel.getAttribute('aria-label')).toBe(TITLE)
    expect(wheel.getAttribute('aria-valuemin')).toBe('0')
    expect(wheel.getAttribute('aria-valuemax')).toBe('180')
    expect(wheel.getAttribute('aria-valuenow')).toBe('120')
    expect(wheel.getAttribute('aria-valuetext')).toBe('120°')
    expect(wheel.tabIndex).toBe(0)
  })

  it('clicks one detent per arrow key and 30 degrees per page key', () => {
    const { wheel, value } = mount(90)
    key(wheel, 'ArrowRight')
    expect(value()).toBe('95°')
    key(wheel, 'ArrowDown')
    key(wheel, 'ArrowLeft')
    expect(value()).toBe('85°')
    key(wheel, 'PageUp')
    expect(value()).toBe('115°')
    key(wheel, 'PageDown')
    expect(value()).toBe('85°')
  })

  it('goes to the ends with Home and End and stops there', () => {
    const spy = vi.fn()
    const { wheel, value } = mount(90, spy)
    key(wheel, 'End')
    expect(value()).toBe('180°')
    key(wheel, 'ArrowUp')
    expect(spy).toHaveBeenCalledTimes(1)
    key(wheel, 'Home')
    expect(value()).toBe('0°')
    key(wheel, 'ArrowDown')
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('ignores keys it does not use', () => {
    const spy = vi.fn()
    const { wheel } = mount(90, spy)
    key(wheel, 'a')
    expect(spy).not.toHaveBeenCalled()
  })

  it('follows a drag around the rim, snapping to detents', () => {
    const { wheel, value } = mount(90)
    pointer(wheel, 'pointerdown', 0, -150) // straight up
    pointer(wheel, 'pointermove', -26, -148) // about 10 degrees anticlockwise
    expect(value()).toBe('100°')
    pointer(wheel, 'pointermove', 26, -148) // about 10 degrees clockwise of the start
    expect(value()).toBe('80°')
    pointer(wheel, 'pointerup', 26, -148)
  })

  it('does not move on a plain tap', () => {
    const spy = vi.fn()
    const { wheel } = mount(90, spy)
    pointer(wheel, 'pointerdown', 0, -150)
    pointer(wheel, 'pointerup', 0, -150)
    expect(spy).not.toHaveBeenCalled()
  })

  it('keeps the end of a drag from reaching the swipe-back handler', () => {
    const { host, wheel } = mount(90)
    const heard = vi.fn()
    host.addEventListener('pointerup', heard)
    pointer(wheel, 'pointerdown', 0, -150)
    pointer(wheel, 'pointerup', 40, -150)
    expect(heard).not.toHaveBeenCalled()
  })

  it('steps one detent per scroll notch and keeps the page still', () => {
    const { wheel, value } = mount(90)
    const up = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })
    act(() => {
      wheel.dispatchEvent(up)
    })
    expect(value()).toBe('95°')
    expect(up.defaultPrevented).toBe(true)
    act(() => {
      wheel.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }))
    })
    expect(value()).toBe('90°')
  })

  it('counts every notch of a fast scroll, even before the screen has redrawn', () => {
    const { wheel, value } = mount(90)
    act(() => {
      for (let notch = 0; notch < 3; notch += 1) {
        wheel.dispatchEvent(
          new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }),
        )
      }
    })
    expect(value()).toBe('105°')
  })

  it('shows the nearest detent for a value between two', () => {
    const { value } = mount(92)
    expect(value()).toBe('90°')
  })
})
