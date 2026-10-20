import { describe, expect, it } from 'vitest'
import { MAX_SCALE, STAGE_MARGIN, computeFitScale } from './fitScale'
import { watchExtent } from '../design/tokens'

describe('computeFitScale', () => {
  it('never enlarges the watch beyond its natural size', () => {
    expect(computeFitScale(1920, 1080)).toBe(MAX_SCALE)
  })

  it('shrinks to fit a 360 px wide phone with the stage margin on each side', () => {
    const scale = computeFitScale(360, 800)
    expect(scale).toBeCloseTo((360 - 2 * STAGE_MARGIN) / watchExtent, 5)
    expect(scale * watchExtent + 2 * STAGE_MARGIN).toBeLessThanOrEqual(360)
  })

  it('is limited by the shorter side in landscape', () => {
    const scale = computeFitScale(800, 360)
    expect(scale).toBeCloseTo(computeFitScale(360, 800), 5)
  })

  it('returns 0 for degenerate viewports', () => {
    expect(computeFitScale(0, 0)).toBe(0)
    expect(computeFitScale(20, 500)).toBe(0)
    expect(computeFitScale(Number.NaN, 500)).toBe(0)
  })
})
