import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RadialTransition } from './RadialTransition'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('RadialTransition', () => {
  it('wraps the screen content', () => {
    const html = renderToString(
      <RadialTransition screenKey="a">
        <p>contenido</p>
      </RadialTransition>,
    )
    expect(html).toContain('data-part="radial-transition"')
    expect(html).toContain('contenido')
  })

  it('remounts the content when the key changes, and not otherwise', () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const render = (key: string) =>
      act(() => root.render(createElement(RadialTransition, { screenKey: key })))

    render('a')
    const first = host.firstElementChild
    render('a')
    expect(host.firstElementChild).toBe(first)
    render('b')
    expect(host.firstElementChild).not.toBe(first)
    act(() => root.unmount())
  })

  describe('stylesheet', () => {
    const css = readFileSync(join(__dirname, 'RadialTransition.module.css'), 'utf8')

    it('scales from 0.92 to 1 while fading, around the center', () => {
      expect(css).toContain('transform-origin: 50% 50%')
      expect(css).toMatch(/from\s*\{[^}]*opacity: 0;[^}]*scale\(0\.92\)/)
      expect(css).toMatch(/to\s*\{[^}]*opacity: 1;[^}]*scale\(1\)/)
      expect(css).toContain('var(--af-dur-standard)')
      expect(css).toContain('var(--af-ease-enter)')
    })

    it('falls back to a plain fade under reduced motion', () => {
      const reduced = css.slice(css.indexOf('prefers-reduced-motion'))
      expect(reduced).toContain('animation-name: fade-in')
      expect(reduced).not.toContain('scale(')
    })
  })
})
