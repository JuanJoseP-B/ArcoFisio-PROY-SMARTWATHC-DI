import { describe, expect, it } from 'vitest'
import { classifyZone, isInPainArc, isOnTarget, isOvershoot } from './zones'

const T = 90
const TOL = 2

describe('classifyZone boundaries', () => {
  it.each([
    [0, 'far'],
    [59.9, 'far'],
    [60, 'approach'],
    [81.9, 'approach'],
    [82, 'near'],
    [87.9, 'near'],
    [88, 'target'],
    [90, 'target'],
    [92, 'target'],
    [92.1, 'overshoot'],
    [180, 'overshoot'],
  ])('classifies %d° as %s', (angle, zone) => {
    expect(classifyZone(angle, T, TOL, null)).toBe(zone)
  })

  it('is relative to the target, not to fixed numbers', () => {
    expect(classifyZone(120, 120, TOL, null)).toBe('target')
    expect(classifyZone(112, 120, TOL, null)).toBe('near')
    expect(classifyZone(90, 120, TOL, null)).toBe('approach')
    expect(classifyZone(89, 120, TOL, null)).toBe('far')
    expect(classifyZone(60, 60, TOL, null)).toBe('target')
  })

  it('moves the target band with the tolerance', () => {
    expect(classifyZone(85, T, 5, null)).toBe('target')
    expect(classifyZone(94.9, T, 5, null)).toBe('target')
    expect(classifyZone(95.1, T, 5, null)).toBe('overshoot')
  })

  it('keeps near empty when the tolerance exceeds the near margin', () => {
    expect(classifyZone(77.9, T, 12, null)).toBe('approach')
    expect(classifyZone(78, T, 12, null)).toBe('target')
  })
})

describe('pain arc priority', () => {
  const pain = { from: 70, to: 110 }

  it('wins over far, approach and near', () => {
    expect(classifyZone(70, 150, TOL, pain)).toBe('pain')
    expect(classifyZone(100, 150, TOL, pain)).toBe('pain')
    expect(classifyZone(110, 150, TOL, pain)).toBe('pain')
    expect(classifyZone(69.9, 150, TOL, pain)).toBe('far')
    expect(classifyZone(110.1, 150, TOL, pain)).toBe('far')
  })

  it('does not win over the target when it lies inside the arc', () => {
    expect(classifyZone(90, 90, TOL, pain)).toBe('target')
    expect(classifyZone(85, 90, TOL, pain)).toBe('pain')
  })

  it('does not win over overshoot', () => {
    expect(classifyZone(100, 90, TOL, pain)).toBe('overshoot')
  })

  it('is ignored when there is no pain arc', () => {
    expect(classifyZone(85, 150, TOL, null)).toBe('far')
  })
})

describe('target helpers', () => {
  it('shares the exact edges with classifyZone', () => {
    expect(isOnTarget(88, T, TOL)).toBe(true)
    expect(isOnTarget(87.99, T, TOL)).toBe(false)
    expect(isOvershoot(92, T, TOL)).toBe(false)
    expect(isOvershoot(92.01, T, TOL)).toBe(true)
  })
})

describe('isInPainArc', () => {
  it('includes both ends of the arc', () => {
    const arc = { from: 70, to: 110 }
    expect(isInPainArc(70, arc)).toBe(true)
    expect(isInPainArc(110, arc)).toBe(true)
    expect(isInPainArc(90, arc)).toBe(true)
  })

  it('leaves out what is just outside it', () => {
    const arc = { from: 70, to: 110 }
    expect(isInPainArc(69.9, arc)).toBe(false)
    expect(isInPainArc(110.1, arc)).toBe(false)
  })

  it('is never true without an arc', () => {
    expect(isInPainArc(90, null)).toBe(false)
  })
})
