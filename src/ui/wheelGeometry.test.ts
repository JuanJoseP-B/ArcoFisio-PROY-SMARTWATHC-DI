import { describe, expect, it } from 'vitest'
import { wheelLabels, wheelPoint, wheelRotation, wheelTicks } from './wheelGeometry'

describe('wheelTicks', () => {
  const ticks = wheelTicks()

  it('draws 72 marks, one per 5 degrees', () => {
    expect(ticks).toHaveLength(72)
    expect(ticks[0]?.angle).toBe(0)
    expect(ticks[71]?.angle).toBe(355)
  })

  it('makes every 30th degree a long mark', () => {
    const majors = ticks.filter((tick) => tick.major).map((tick) => tick.angle)
    expect(majors).toEqual([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330])
  })

  it('starts the 0 degree mark straight up from the centre, long and short alike', () => {
    expect(ticks[0]).toMatchObject({ x1: 192, y1: 46, x2: 192, y2: 24 })
    expect(ticks[1]).toMatchObject({ major: false })
  })
})

describe('wheelLabels', () => {
  it('labels only the long marks on the scale: 0 to 180 every 30', () => {
    expect(wheelLabels().map((label) => label.angle)).toEqual([0, 30, 60, 90, 120, 150, 180])
  })

  it('places 90 degrees to the right of the centre', () => {
    const label = wheelLabels().find((item) => item.angle === 90)
    expect(label).toMatchObject({ x: 320, y: 192 })
  })
})

describe('wheelPoint', () => {
  it('measures clockwise from straight up', () => {
    const [x, y] = wheelPoint(180, 100)
    expect(x).toBeCloseTo(192)
    expect(y).toBeCloseTo(292)
  })
})

describe('wheelRotation', () => {
  it('turns the wheel against the value', () => {
    expect(wheelRotation(90)).toBe(-90)
    expect(wheelRotation(0)).toBe(-0)
  })
})
