import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { SensorProbe } from './SensorProbe'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('SensorProbe', () => {
  it('shows a live simulated reading and a slider under ?sim=1', () => {
    window.history.replaceState(null, '', '/?probe=1&sim=1')
    const container = document.createElement('div')
    const root = createRoot(container)
    act(() => root.render(createElement(SensorProbe)))

    expect(container.textContent).toContain('sim · live')
    expect(container.textContent).toContain('0.0°')
    expect(container.querySelector('input[type="range"]')).not.toBeNull()
    expect(container.querySelectorAll('button')).toHaveLength(2)

    act(() => root.unmount())
  })
})
