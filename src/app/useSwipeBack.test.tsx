import { act, createElement, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSwipeBack } from './useSwipeBack'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function Surface({ onBack, enabled }: { onBack: () => void; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useSwipeBack(ref, onBack, enabled)
  return <div ref={ref} data-part="surface" />
}

function mount(onBack: () => void, enabled = true) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(Surface, { onBack, enabled })))
  const surface = host.querySelector<HTMLElement>('[data-part="surface"]')!
  // jsdom has no layout: give the surface the watch width.
  surface.getBoundingClientRect = () => ({ width: 384 }) as DOMRect
  return {
    surface,
    root,
    rerender: (on: boolean) =>
      act(() => root.render(createElement(Surface, { onBack, enabled: on }))),
  }
}

function swipe(surface: HTMLElement, from: [number, number], to: [number, number], ms = 200) {
  const event = (type: string, [x, y]: [number, number], t: number) => {
    const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
    Object.defineProperty(e, 'timeStamp', { value: t })
    return e
  }
  act(() => {
    surface.dispatchEvent(event('pointerdown', from, 1000))
    surface.dispatchEvent(event('pointerup', to, 1000 + ms))
  })
}

describe('useSwipeBack', () => {
  it('goes back on a left-to-right swipe', () => {
    const onBack = vi.fn()
    const { surface } = mount(onBack)
    swipe(surface, [100, 200], [220, 205])
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('ignores taps, short moves, reverse swipes and slow drags', () => {
    const onBack = vi.fn()
    const { surface } = mount(onBack)
    swipe(surface, [100, 200], [100, 200], 50)
    swipe(surface, [100, 200], [130, 200])
    swipe(surface, [220, 200], [100, 200])
    swipe(surface, [100, 200], [260, 200], 2000)
    expect(onBack).not.toHaveBeenCalled()
  })

  it('forgets a gesture that the browser cancelled', () => {
    const onBack = vi.fn()
    const { surface } = mount(onBack)
    act(() => {
      surface.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, clientY: 200 }))
      surface.dispatchEvent(new Event('pointercancel'))
      surface.dispatchEvent(new MouseEvent('pointerup', { clientX: 260, clientY: 200 }))
    })
    expect(onBack).not.toHaveBeenCalled()
  })

  it('does nothing while disabled, and works again when enabled', () => {
    const onBack = vi.fn()
    const { surface, rerender } = mount(onBack, false)
    swipe(surface, [100, 200], [220, 200])
    expect(onBack).not.toHaveBeenCalled()

    rerender(true)
    swipe(surface, [100, 200], [220, 200])
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('stops listening on unmount', () => {
    const onBack = vi.fn()
    const { surface, root } = mount(onBack)
    act(() => root.unmount())
    roots.length = 0
    swipe(surface, [100, 200], [220, 200])
    expect(onBack).not.toHaveBeenCalled()
  })
})
