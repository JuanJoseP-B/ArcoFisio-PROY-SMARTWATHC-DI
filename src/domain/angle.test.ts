import { describe, expect, it } from 'vitest'
import { computeAngle } from './angle'
import type { Vec3 } from './vector'

const G = 9.81
const hanging: Vec3 = [0, 0, G]
const calibration = { gravityRef: hanging }

const rotated = (degrees: number, magnitude = G): Vec3 => {
  const r = (degrees * Math.PI) / 180
  return [magnitude * Math.sin(r), 0, magnitude * Math.cos(r)]
}

describe('computeAngle', () => {
  it.each([0, 45, 90, 135, 180])('measures %i degrees', (degrees) => {
    expect(computeAngle(rotated(degrees), calibration)).toBeCloseTo(degrees, 6)
  })

  it('does not depend on the vector magnitude', () => {
    expect(computeAngle(rotated(90, 1), calibration)).toBeCloseTo(90, 6)
    expect(computeAngle(rotated(90, 40), { gravityRef: [0, 0, 1] })).toBeCloseTo(90, 6)
  })

  it('does not depend on the rotation axis or the screen orientation', () => {
    const tilted: Vec3 = [0, G * Math.sin(Math.PI / 3), G * Math.cos(Math.PI / 3)]
    expect(computeAngle(tilted, calibration)).toBeCloseTo(60, 6)
    expect(computeAngle([G, 0, 0], { gravityRef: [0, G, 0] })).toBeCloseTo(90, 6)
  })

  it('works with a calibration that is not axis aligned', () => {
    const ref: Vec3 = [3, 4, 5]
    expect(computeAngle(ref, { gravityRef: ref })).toBeCloseTo(0, 3)
    expect(computeAngle([-3, -4, -5], { gravityRef: ref })).toBeCloseTo(180, 3)
  })

  it('stays within 0..180 even when rounding pushes the cosine past 1', () => {
    const almost: Vec3 = [1e-9, 0, 1]
    const result = computeAngle(almost, { gravityRef: [0, 0, 1] })
    expect(result).not.toBeNull()
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(180)
  })

  it('keeps small sensor noise below half a degree around a fixed pose', () => {
    let seed = 7
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.04
    for (let i = 0; i < 200; i++) {
      const noisy: Vec3 = [random(), random(), G + random()]
      expect(computeAngle(noisy, calibration)).toBeLessThan(0.5)
    }
  })

  it('returns null when a vector has no usable direction', () => {
    expect(computeAngle([0, 0, 0], calibration)).toBeNull()
    expect(computeAngle(hanging, { gravityRef: [0, 0, 0] })).toBeNull()
    expect(computeAngle([Number.NaN, 0, 1], calibration)).toBeNull()
  })
})
