import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { geometry } from '../design/tokens'
import { BackButton } from './BackButton'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('BackButton', () => {
  it('is a labelled button with a decorative arrow', () => {
    const html = renderToString(<BackButton label="Atrás" onBack={() => undefined} />)
    expect(html).toContain('aria-label="Atrás"')
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-hidden="true"')
  })

  it('goes back when tapped', () => {
    const onBack = vi.fn()
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(createElement(BackButton, { label: 'Back', onBack })))
    act(() => host.querySelector('button')?.click())
    expect(onBack).toHaveBeenCalledTimes(1)
    act(() => root.unmount())
  })

  it('sits at the top by default and can sit at the bottom', () => {
    expect(renderToString(<BackButton label="x" onBack={() => undefined} />)).toContain(
      'data-placement="top"',
    )
    expect(
      renderToString(<BackButton label="x" onBack={() => undefined} placement="bottom" />),
    ).toContain('data-placement="bottom"')
  })

  it('meets the 48 px touch target and stays inside the safe circle', () => {
    const css = readFileSync(join(__dirname, 'BackButton.module.css'), 'utf8')
    expect(geometry.touchMin).toBeGreaterThanOrEqual(48)
    expect(css).toContain('width: var(--af-touch-min)')
    expect(css).toContain('height: var(--af-touch-min)')
    // top edge at 34 px: its corners are 160 px from the center, inside the 164 px safe radius
    const distance = Math.hypot(24, 192 - 34)
    expect(distance).toBeLessThan(geometry.screenSize / 2 - geometry.safeMargin)
    expect(css).toMatch(/\.top \{\s*top: 34px/)
    expect(css).toMatch(/\.bottom \{\s*bottom: 34px/)
  })
})
