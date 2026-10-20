import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTER, clampAngle, filterAngle } from './filter'

describe('clampAngle', () => {
  it('limits the angle to 0..180', () => {
    expect(clampAngle(-3)).toBe(0)
    expect(clampAngle(95)).toBe(95)
    expect(clampAngle(200)).toBe(180)
  })
})

describe('filterAngle', () => {
  it('starts from the first reading without smoothing', () => {
    expect(filterAngle(null, 42)).toBe(42)
    expect(filterAngle(null, 250)).toBe(180)
  })

  it('applies the exponential average with alpha 0.25', () => {
    expect(filterAngle(0, 40)).toBeCloseTo(10, 10)
    expect(filterAngle(10, 40)).toBeCloseTo(17.5, 10)
  })

  it('ignores changes smaller than the 0.5 degree dead zone', () => {
    expect(filterAngle(50, 50.4)).toBe(50)
    expect(filterAngle(50, 49.6)).toBe(50)
    expect(filterAngle(50, 50.5)).toBeGreaterThan(50)
  })

  it('converges to a steady input within the dead zone', () => {
    let value: number | null = null
    for (let i = 0; i < 60; i++) value = filterAngle(value, 90)
    expect(Math.abs((value ?? 0) - 90)).toBeLessThan(DEFAULT_FILTER.deadZone)
  })

  it('never leaves the 0..180 range', () => {
    expect(filterAngle(179, 400)).toBeLessThanOrEqual(180)
    expect(filterAngle(1, -400)).toBeGreaterThanOrEqual(0)
  })

  it('accepts a custom configuration', () => {
    expect(filterAngle(0, 10, { alpha: 1, deadZone: 0 })).toBe(10)
  })
})
