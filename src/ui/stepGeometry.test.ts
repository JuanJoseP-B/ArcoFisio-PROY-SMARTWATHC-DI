import { describe, expect, it } from 'vitest'
import {
  MAX_STEP_SEGMENTS,
  aimAngle,
  completedSegments,
  segmentCount,
  stepSegments,
} from './stepGeometry'

describe('stepGeometry', () => {
  it('uses one segment per repetition up to 20 and shares them beyond that', () => {
    expect(segmentCount(1)).toBe(1)
    expect(segmentCount(10)).toBe(10)
    expect(segmentCount(20)).toBe(MAX_STEP_SEGMENTS)
    expect(segmentCount(99)).toBe(MAX_STEP_SEGMENTS)
    expect(segmentCount(0)).toBe(1)
  })

  it('paints ten segments of 36 degrees like the sheet, with 29.8 degrees each', () => {
    const segments = stepSegments(0, 10)
    expect(segments).toHaveLength(10)
    // 29.8 degrees of a 1030.44 ring.
    expect(segments[0]?.dash).toBeCloseTo(85.3, 1)
    expect(segments[1]!.offset - segments[0]!.offset).toBeCloseTo(-103.04, 1)
  })

  it('closes, marks and leaves the segments in order', () => {
    expect(stepSegments(3, 10).map((s) => s.state)).toEqual([
      'done',
      'done',
      'done',
      'active',
      'todo',
      'todo',
      'todo',
      'todo',
      'todo',
      'todo',
    ])
  })

  it('closes every segment, with none active, when all repetitions are done', () => {
    expect(stepSegments(10, 10).every((s) => s.state === 'done')).toBe(true)
  })

  it('shares segments when there are more than 20 repetitions', () => {
    expect(completedSegments(50, 100)).toBe(10)
    expect(completedSegments(4, 100)).toBe(0)
    expect(completedSegments(5, 100)).toBe(1)
    expect(completedSegments(100, 100)).toBe(20)
  })

  it('keeps the done count inside the total', () => {
    expect(completedSegments(-3, 10)).toBe(0)
    expect(completedSegments(15, 10)).toBe(10)
    expect(completedSegments(2, 0)).toBe(0)
  })

  it('aims the arrow at the middle of the segment just closed', () => {
    expect(aimAngle(1, 10)).toBe(18)
    expect(aimAngle(10, 10)).toBe(342)
    expect(aimAngle(0, 10)).toBe(18)
    expect(aimAngle(2, 4)).toBe(135)
  })
})
