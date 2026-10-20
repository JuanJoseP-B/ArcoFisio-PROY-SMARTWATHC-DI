import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { ArrowHit } from './ArrowHit'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function mount(props: { hit?: boolean; lift?: number } = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(ArrowHit, props)))
  const part = (name: string) => host.querySelector<SVGElement>(`[data-part="${name}"]`)
  return { host, part }
}

describe('ArrowHit', () => {
  it('draws 24 rays and the two rings of the sunburst', () => {
    const { part } = mount()
    const sunburst = part('sunburst')!
    expect(sunburst.querySelectorAll('path')).toHaveLength(24)
    expect(sunburst.querySelectorAll('circle')).toHaveLength(2)
  })

  it('draws the target at 192, 122 with its four rings', () => {
    const { part } = mount()
    const circles = [...part('arrow-hit')!.querySelectorAll('circle')].filter(
      (c) => c.getAttribute('fill') !== 'none',
    )
    expect(circles.map((c) => c.getAttribute('r'))).toEqual(['46', '34', '21', '8'])
    expect(
      circles.every((c) => c.getAttribute('cx') === '192' && c.getAttribute('cy') === '122'),
    ).toBe(true)
  })

  it('flies the arrow in and spreads two rings from the target', () => {
    const { part, host } = mount()
    expect(part('arrow')).not.toBeNull()
    expect(host.querySelectorAll('circle[fill="none"][r="46"]')).toHaveLength(2)
  })

  it('leaves the target alone, without arrow or rings, when there is no hit', () => {
    const { part, host } = mount({ hit: false })
    expect(part('arrow')).toBeNull()
    expect(host.querySelectorAll('circle[fill="none"][r="46"]')).toHaveLength(0)
    expect(part('arrow-hit')?.dataset.hit).toBe('false')
  })

  it('raises the target by the lift', () => {
    expect(mount().part('arrow-hit')?.style.top).toBe('0px')
    document.body.innerHTML = ''
    expect(mount({ lift: 14 }).part('arrow-hit')?.style.top).toBe('-14px')
  })

  it('is hidden from assistive technology: it is only decoration', () => {
    const { part } = mount()
    expect(part('sunburst')?.getAttribute('aria-hidden')).toBe('true')
    expect(part('arrow-hit')?.getAttribute('aria-hidden')).toBe('true')
  })
})
