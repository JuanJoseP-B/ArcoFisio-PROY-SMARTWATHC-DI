import { describe, expect, it } from 'vitest'
import {
  bezelDiameter,
  color,
  duration,
  geometry,
  safeDiameter,
  typography,
  watchExtent,
} from './tokens'

describe('color tokens', () => {
  it('uses the sheet palette, not the design-system tokens.json one', () => {
    expect(color.ink).toBe('#1F3A2B')
    expect(color.gold).toBe('#C8902E')
    expect(color.bronze).toBe('#7A4E14')
    expect(color.surfaceSunken).toBe('#E3CA9C')
    expect(color.zonePain).toBe('#A3392D')
  })

  it('holds only valid hex or rgba values', () => {
    for (const value of Object.values(color)) {
      expect(value).toMatch(/^(#[0-9A-F]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/)
    }
  })
})

describe('geometry tokens', () => {
  it('keeps the 328 px safe circle and the bezel sizes', () => {
    expect(safeDiameter).toBe(328)
    expect(bezelDiameter).toBe(408)
    expect(watchExtent).toBe(414)
  })

  it('matches the ring circumference to the ring radius', () => {
    const exact = 2 * Math.PI * geometry.ringRadius
    expect(geometry.ringCircumference).toBeCloseTo(exact, 1)
  })

  it('guarantees the minimum touch target', () => {
    expect(geometry.touchMin).toBeGreaterThanOrEqual(48)
  })
})

describe('typography and motion tokens', () => {
  it('never goes below the 11 px caption minimum', () => {
    for (const style of Object.values(typography)) {
      expect(style.size).toBeGreaterThanOrEqual(11)
      expect(style.lineHeight).toBeGreaterThanOrEqual(style.size)
    }
  })

  it('orders durations from fastest to slowest', () => {
    const values = Object.values(duration)
    expect([...values].sort((a, b) => a - b)).toEqual(values)
  })
})
