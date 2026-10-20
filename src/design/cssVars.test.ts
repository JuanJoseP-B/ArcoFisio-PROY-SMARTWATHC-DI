import { describe, expect, it } from 'vitest'
import { buildCssVariables, installCssVariables } from './cssVars'

describe('buildCssVariables', () => {
  const vars = buildCssVariables()

  it('exposes colors, geometry, type and motion under the --af- prefix', () => {
    expect(vars['--af-color-ink']).toBe('#1F3A2B')
    expect(vars['--af-color-zone-pain-tint']).toBe('#F4D3C8')
    expect(vars['--af-screen-size']).toBe('384px')
    expect(vars['--af-safe-diameter']).toBe('328px')
    expect(vars['--af-ring-circumference']).toBe('1030.44')
    expect(vars['--af-space-4']).toBe('16px')
    expect(vars['--af-type-hero-size']).toBe('72px')
    expect(vars['--af-dur-standard']).toBe('300ms')
    expect(vars['--af-ease-enter']).toBe('cubic-bezier(0.05, 0.7, 0.1, 1)')
  })

  it('has no empty values and only valid custom property names', () => {
    for (const [name, value] of Object.entries(vars)) {
      expect(name).toMatch(/^--af-[a-z0-9-]+$/)
      expect(value).not.toBe('')
    }
  })
})

describe('installCssVariables', () => {
  it('writes every variable onto the target element', () => {
    const el = document.createElement('div')
    installCssVariables(el)
    expect(el.style.getPropertyValue('--af-color-gold')).toBe('#C8902E')
    expect(el.style.getPropertyValue('--af-dur-ambient')).toBe('1600ms')
  })
})
