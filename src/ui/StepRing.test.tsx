import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { StepRing } from './StepRing'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(done: number, total: number) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  const show = (d: number, t: number) =>
    act(() => root.render(createElement(StepRing, { done: d, total: t })))
  show(done, total)
  const states = () =>
    [...host.querySelectorAll<SVGElement>('circle')].map((c) => c.getAttribute('data-state'))
  const arrow = () => host.querySelector<SVGGElement>('[data-part="step-arrow"]')
  return { host, show, states, arrow }
}

describe('StepRing', () => {
  it('draws one segment per step with the finished ones closed', () => {
    const { states } = mount(2, 5)
    expect(states()).toEqual(['done', 'done', 'active', 'todo', 'todo'])
  })

  it('is decorative and carries the counts for tests and tools', () => {
    const { host } = mount(1, 3)
    const svg = host.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('data-done')).toBe('1')
    expect(svg.getAttribute('data-total')).toBe('3')
  })

  it('has no arrow before the first step', () => {
    expect(mount(0, 4).arrow()).toBeNull()
  })

  it('aims the arrow at the segment just closed and shoots again on each step', () => {
    const { show, arrow } = mount(1, 4)
    expect(arrow()?.style.getPropertyValue('--aim')).toBe('45deg')

    const first = arrow()
    show(2, 4)
    expect(arrow()?.style.getPropertyValue('--aim')).toBe('135deg')
    // A new element, so the animation starts again.
    expect(arrow()).not.toBe(first)
  })

  it('closes every segment on the last step', () => {
    expect(mount(3, 3).states()).toEqual(['done', 'done', 'done'])
  })
})
