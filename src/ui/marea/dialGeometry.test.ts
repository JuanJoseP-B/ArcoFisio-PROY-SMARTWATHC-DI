import { describe, expect, it } from 'vitest'
import {
  AMBIENT_WATER,
  DIAL_ARC_LENGTH,
  TICK_DASH,
  TRACK_PATH,
  dialPoint,
  ringButtonCenter,
  targetNotchPath,
  waterLevelFor,
} from './dialGeometry'

describe('dialPoint', () => {
  // Reference table of handoff 03 (R = 170).
  const table: [number, number, number][] = [
    [0, 192, 362],
    [30, 277, 339.2],
    [60, 339.2, 277],
    [64, 344.8, 266.5],
    [72, 353.7, 244.5],
    [90, 362, 192],
    [96, 361.1, 174.2],
    [100, 359.4, 162.5],
    [106, 355.4, 145.1],
    [110, 351.7, 133.9],
    [125, 331.3, 94.5],
    [128, 326, 87.3],
    [150, 277, 44.8],
    [180, 192, 22],
  ]

  it.each(table)('puts %i degrees at (%f, %f)', (deg, x, y) => {
    const point = dialPoint(deg)
    expect(point.x).toBeCloseTo(x, 1)
    expect(point.y).toBeCloseTo(y, 1)
  })

  it('stays on the scale when the angle is out of range', () => {
    expect(dialPoint(-20)).toEqual(dialPoint(0))
    expect(dialPoint(200)).toEqual(dialPoint(180))
  })
})

describe('water and notch', () => {
  it('puts the water at the same height as the marker', () => {
    for (const deg of [0, 45, 90, 135, 180]) expect(waterLevelFor(deg)).toBe(dialPoint(deg).y)
  })

  it('draws the target notch like the handoff: M342 y H380', () => {
    expect(targetNotchPath(90)).toBe('M342 192H380')
    expect(targetNotchPath(0)).toBe('M342 362H380')
  })

  it('keeps the ambient water levels of the tide phases', () => {
    expect(AMBIENT_WATER.loading).toBe(338)
    expect(AMBIENT_WATER.start).toBe(318)
    expect(AMBIENT_WATER.prepare).toBe(304)
  })
})

describe('track', () => {
  it('draws the half ring from 0 to 180 degrees', () => {
    expect(TRACK_PATH).toBe('M192 362 A170 170 0 0 0 192 22')
  })

  it('places one tick every 10 degrees', () => {
    expect(DIAL_ARC_LENGTH).toBeCloseTo(534.07, 2)
    expect(TICK_DASH).toBe('1.6 28.07')
  })
})

describe('ringButtonCenter', () => {
  // Centres of the seven menu buttons listed in handoff 03.
  const expected = [
    [192, 60],
    [295.2, 109.7],
    [320.7, 221.4],
    [249.3, 310.9],
    [134.7, 310.9],
    [63.3, 221.4],
    [88.8, 109.7],
  ]

  it.each(expected.map((xy, index) => [index, ...xy] as const))(
    'places button %i at (%f, %f)',
    (index, x, y) => {
      const point = ringButtonCenter(index, 7, 132)
      expect(point.x).toBeCloseTo(x, 1)
      expect(point.y).toBeCloseTo(y, 1)
    },
  )
})
