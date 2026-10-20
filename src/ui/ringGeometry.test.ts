import { describe, expect, it } from 'vitest'
import { geometry } from '../design/tokens'
import { RING_CENTER, RING_TOP_Y, clampAngle, ringGeometry } from './ringGeometry'

describe('ringGeometry', () => {
  it('paints nothing at 0 degrees and a quarter of the ring at 90', () => {
    expect(ringGeometry(0).dashOffset).toBeCloseTo(geometry.ringCircumference, 5)
    expect(ringGeometry(90).dashOffset).toBeCloseTo(geometry.ringCircumference * 0.75, 5)
  })

  it('paints half the ring at 180 degrees', () => {
    expect(ringGeometry(180).dashOffset).toBeCloseTo(geometry.ringCircumference / 2, 5)
  })

  it('puts the string tip at the top, the right side and the bottom of the ring', () => {
    const top = ringGeometry(0)
    expect(top.tipX).toBeCloseTo(RING_CENTER, 5)
    expect(top.tipY).toBeCloseTo(RING_TOP_Y, 5)

    const side = ringGeometry(90)
    expect(side.tipX).toBeCloseTo(RING_CENTER + geometry.ringRadius, 5)
    expect(side.tipY).toBeCloseTo(RING_CENTER, 5)

    const bottom = ringGeometry(180)
    expect(bottom.tipX).toBeCloseTo(RING_CENTER, 5)
    expect(bottom.tipY).toBeCloseTo(RING_CENTER + geometry.ringRadius, 5)
  })

  it('matches the sheet at 150 degrees', () => {
    const g = ringGeometry(150)
    expect(g.tipX).toBeCloseTo(274, 0)
    expect(g.tipY).toBeCloseTo(334, 0)
    expect(g.dashOffset).toBeCloseTo(1030.44 * (1 - 150 / 360), 5)
  })

  it('shows the dotted string only past 6 degrees', () => {
    expect(ringGeometry(6).stringOpacity).toBe(0)
    expect(ringGeometry(6.1).stringOpacity).toBe(0.45)
  })

  it('keeps out-of-range angles on the dial', () => {
    expect(clampAngle(-10)).toBe(0)
    expect(clampAngle(200)).toBe(180)
    expect(ringGeometry(-5)).toEqual(ringGeometry(0))
    expect(ringGeometry(400)).toEqual(ringGeometry(180))
  })
})
