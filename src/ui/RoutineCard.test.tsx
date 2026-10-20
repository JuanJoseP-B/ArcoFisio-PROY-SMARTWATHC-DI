import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RoutineCard } from './RoutineCard'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(props: Partial<Parameters<typeof RoutineCard>[0]> = {}) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  const onPress = vi.fn()
  act(() => root.render(createElement(RoutineCard, { title: 'Flexión 150°', onPress, ...props })))
  const card = host.querySelector<HTMLButtonElement>('[data-part="routine-card"]')!
  return { host, card, onPress }
}

describe('RoutineCard', () => {
  it('shows the name and the details line', () => {
    const { host } = mount({ subtitle: '3×8 · 150°' })
    expect(host.querySelector('[data-part="card-title"]')?.textContent).toBe('Flexión 150°')
    expect(host.querySelector('[data-part="card-subtitle"]')?.textContent).toBe('3×8 · 150°')
  })

  it('leaves out the details line when there is none', () => {
    expect(mount().host.querySelector('[data-part="card-subtitle"]')).toBeNull()
  })

  it('is a button that presses', () => {
    const { card, onPress } = mount()
    expect(card.tagName).toBe('BUTTON')
    act(() => card.click())
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('fills the thumbnail ring by the share it is given', () => {
    const { host } = mount({ fill: 0.5 })
    const ring = host.querySelector('[data-part="card-fill"]')!
    expect(Number(ring.getAttribute('stroke-dashoffset'))).toBeCloseTo(31.5, 1)
    expect((ring as SVGElement).style.getPropertyValue('--o')).toBe('31.5')
  })

  it('keeps the fill inside 0 to 1', () => {
    const over = mount({ fill: 3 }).host.querySelector('[data-part="card-fill"]')
    expect(Number(over?.getAttribute('stroke-dashoffset'))).toBe(0)
    const under = mount({ fill: -1 }).host.querySelector('[data-part="card-fill"]')
    expect(Number(under?.getAttribute('stroke-dashoffset'))).toBe(63)
  })

  it('draws a plus instead of a ring for an action card', () => {
    const { host } = mount({ title: 'Nueva rutina' })
    expect(host.querySelector('[data-part="card-fill"]')).toBeNull()
    expect(host.querySelector('svg path')).not.toBeNull()
  })

  it('enters 120 ms after the card before it, up to the third', () => {
    const delayOf = (index: number) => mount({ index }).card.style.animationDelay
    expect(delayOf(0)).toBe('0ms')
    expect(delayOf(1)).toBe('120ms')
    expect(delayOf(2)).toBe('240ms')
    expect(delayOf(9)).toBe('240ms')
  })

  it('keeps its thumbnail out of the reading order', () => {
    const { host } = mount({ fill: 0.3 })
    expect(host.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
