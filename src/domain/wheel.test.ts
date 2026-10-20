import { describe, expect, it } from 'vitest'
import { dragValue, pointerDirection, snapAngle, stepAngle, turnBetween } from './wheel'

describe('snapAngle', () => {
  it('rounds to the nearest detent of 5 degrees', () => {
    expect(snapAngle(92)).toBe(90)
    expect(snapAngle(93)).toBe(95)
    expect(snapAngle(0)).toBe(0)
    expect(snapAngle(180)).toBe(180)
  })

  it('stays inside 0..180', () => {
    expect(snapAngle(-40)).toBe(0)
    expect(snapAngle(400)).toBe(180)
  })

  it('falls back to 0 for values that are not numbers', () => {
    expect(snapAngle(Number.NaN)).toBe(0)
    expect(snapAngle(Number.POSITIVE_INFINITY)).toBe(0)
  })
})

describe('stepAngle', () => {
  it('moves whole detents', () => {
    expect(stepAngle(90, 1)).toBe(95)
    expect(stepAngle(90, -2)).toBe(80)
    expect(stepAngle(90, 6)).toBe(120)
  })

  it('stops at both ends instead of wrapping', () => {
    expect(stepAngle(0, -1)).toBe(0)
    expect(stepAngle(180, 1)).toBe(180)
    expect(stepAngle(175, 10)).toBe(180)
  })

  it('first lands an off-detent value on a detent', () => {
    expect(stepAngle(92, 1)).toBe(95)
  })
})

describe('turnBetween', () => {
  it('takes the short way round', () => {
    expect(turnBetween(10, 30)).toBe(20)
    expect(turnBetween(30, 10)).toBe(-20)
    expect(turnBetween(170, -170)).toBe(20)
    expect(turnBetween(-170, 170)).toBe(-20)
  })
})

describe('pointerDirection', () => {
  it('measures clockwise from straight up', () => {
    expect(pointerDirection(0, 0, 0, -10)).toBeCloseTo(0)
    expect(pointerDirection(0, 0, 10, 0)).toBeCloseTo(90)
    expect(pointerDirection(0, 0, 0, 10)).toBeCloseTo(180)
    expect(pointerDirection(0, 0, -10, 0)).toBeCloseTo(-90)
  })
})

describe('dragValue', () => {
  it('lowers the value when the rim is pulled clockwise and raises it the other way', () => {
    expect(dragValue(90, 0, 20)).toBe(70)
    expect(dragValue(90, 0, -20)).toBe(110)
  })

  it('snaps to detents while dragging', () => {
    expect(dragValue(90, 0, -7)).toBe(95)
    expect(dragValue(90, 0, -2)).toBe(90)
  })

  it('clamps at the ends of the scale', () => {
    expect(dragValue(10, 0, 90)).toBe(0)
    expect(dragValue(170, 0, -90)).toBe(180)
  })
})
