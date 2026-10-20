import { describe, expect, it } from 'vitest'
import {
  clamp01,
  cubicBezier,
  easeInOutCubic,
  easeOutCubic,
  lerp,
  ramp,
  smoothstep,
} from './motion'

describe('ramp and clamp', () => {
  it('clamps to the unit interval', () => {
    expect(clamp01(-3)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(7)).toBe(1)
  })

  it('maps a window onto 0..1', () => {
    expect(ramp(0.1, 0.2, 0.6)).toBe(0)
    expect(ramp(0.4, 0.2, 0.6)).toBeCloseTo(0.5, 10)
    expect(ramp(0.9, 0.2, 0.6)).toBe(1)
  })

  it('interpolates linearly', () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5)
  })
})

describe('easing curves', () => {
  it('start at 0, end at 1 and stay in range outside the window', () => {
    for (const fn of [easeInOutCubic, easeOutCubic, smoothstep]) {
      expect(fn(0)).toBe(0)
      expect(fn(1)).toBe(1)
      expect(fn(-1)).toBe(0)
      expect(fn(2)).toBe(1)
    }
  })

  it('is symmetric at the midpoint for the in-out curves', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10)
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 10)
  })

  it('eases out faster than linear at the start', () => {
    expect(easeOutCubic(0.25)).toBeGreaterThan(0.25)
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25)
  })
})

describe('cubicBezier', () => {
  it('is the identity for the linear control points', () => {
    const linear = cubicBezier(0, 0, 1, 1)
    for (const t of [0, 0.2, 0.5, 0.8, 1]) expect(linear(t)).toBeCloseTo(t, 4)
  })

  it('pins the endpoints for the design-system curves', () => {
    for (const curve of [
      cubicBezier(0.2, 0, 0, 1),
      cubicBezier(0.05, 0.7, 0.1, 1),
      cubicBezier(0.3, 0, 0.8, 0.15),
    ]) {
      expect(curve(0)).toBeCloseTo(0, 5)
      expect(curve(1)).toBeCloseTo(1, 5)
    }
  })

  it('rises quickly for the enter curve and slowly for the exit curve', () => {
    expect(cubicBezier(0.05, 0.7, 0.1, 1)(0.2)).toBeGreaterThan(0.5)
    expect(cubicBezier(0.3, 0, 0.8, 0.15)(0.5)).toBeLessThan(0.3)
  })

  it('overshoots with the wheel spring', () => {
    const wheel = cubicBezier(0.34, 1.56, 0.64, 1)
    expect(wheel(0.6)).toBeGreaterThan(1)
  })
})
