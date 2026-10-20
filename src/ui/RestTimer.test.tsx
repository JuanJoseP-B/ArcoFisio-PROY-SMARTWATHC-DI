import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { geometry } from '../design/tokens'
import { RestTimer } from './RestTimer'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(props: { progress: number; done?: boolean; label?: string; time?: string }) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(RestTimer, {
        progress: props.progress,
        done: props.done ?? false,
        label: props.label ?? 'Descanso',
        time: props.time ?? '0:30',
      }),
    ),
  )
  const part = (name: string) =>
    host.querySelector<SVGElement | HTMLElement>(`[data-part="${name}"]`)
  return { host, part }
}

describe('RestTimer', () => {
  it('shows the label and the time it is given', () => {
    const { part } = mount({ progress: 0, label: 'Descanso', time: '0:30' })
    expect(part('rest-label')?.textContent).toBe('Descanso')
    expect(part('rest-time')?.textContent).toBe('0:30')
  })

  it('empties the ring as the rest runs', () => {
    const { part } = mount({ progress: 0.25 })
    const offset = Number(part('rest-arc')?.getAttribute('stroke-dashoffset'))
    expect(offset).toBeCloseTo(geometry.ringCircumference / 4, 1)
  })

  it('draws the string back with the arrow, while the rest runs', () => {
    const early = mount({ progress: 0 })
    const late = mount({ progress: 1 })
    const tip = (m: ReturnType<typeof mount>) =>
      m.part('rest-arrow')?.querySelector('path')?.getAttribute('d')
    expect(tip(early)).not.toBe(tip(late))
  })

  it('marks the end and lets the arrow go', () => {
    const running = mount({ progress: 0.5 })
    expect(running.part('rest-timer')?.getAttribute('data-done')).toBe('false')
    expect(running.part('rest-arrow')?.getAttribute('class')).toBeNull()

    const over = mount({ progress: 1, done: true, label: 'Siguiente serie', time: '¡Listo!' })
    expect(over.part('rest-timer')?.getAttribute('data-done')).toBe('true')
    expect(over.part('rest-arrow')?.getAttribute('class')).toBeTruthy()
    expect(over.part('rest-time')?.textContent).toBe('¡Listo!')
  })

  it('is decorative apart from its text', () => {
    const { host } = mount({ progress: 0.5 })
    for (const svg of host.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true')
    }
  })
})
