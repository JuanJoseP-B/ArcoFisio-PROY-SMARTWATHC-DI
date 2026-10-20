import { describe, expect, it } from 'vitest'
import { MIN_PAIN_ARC_DEG } from './constants'
import { IDLE_MARKING, finishMarking, liveArc, startMarking } from './painMarking'

describe('startMarking', () => {
  it('remembers the angle where the pain starts, in whole degrees', () => {
    expect(startMarking(70.4)).toEqual({ phase: 'marking', from: 70 })
  })

  it('keeps the angle inside the ring', () => {
    expect(startMarking(-4)).toEqual({ phase: 'marking', from: 0 })
    expect(startMarking(190)).toEqual({ phase: 'marking', from: 180 })
  })
})

describe('finishMarking', () => {
  it('returns the arc between the two taps', () => {
    expect(finishMarking(startMarking(70), 110)).toEqual({ from: 70, to: 110 })
  })

  it('puts the ends in order when the arm went down instead of up', () => {
    expect(finishMarking(startMarking(110), 70)).toEqual({ from: 70, to: 110 })
  })

  it('rounds the closing angle to whole degrees', () => {
    expect(finishMarking(startMarking(70), 109.6)).toEqual({ from: 70, to: 110 })
  })

  it('accepts an arc exactly as wide as the minimum', () => {
    expect(finishMarking(startMarking(40), 40 + MIN_PAIN_ARC_DEG)).toEqual({
      from: 40,
      to: 40 + MIN_PAIN_ARC_DEG,
    })
  })

  it('rejects an arc narrower than the minimum', () => {
    expect(finishMarking(startMarking(40), 40 + MIN_PAIN_ARC_DEG - 1)).toBeNull()
    expect(finishMarking(startMarking(40), 40)).toBeNull()
  })

  it('rejects a finish with no start', () => {
    expect(finishMarking(IDLE_MARKING, 110)).toBeNull()
  })

  it('keeps the arc inside the ring', () => {
    expect(finishMarking(startMarking(150), 200)).toEqual({ from: 150, to: 180 })
  })
})

describe('liveArc', () => {
  it('grows from the start to the live angle', () => {
    expect(liveArc(startMarking(70), 95)).toEqual({ from: 70, to: 95 })
  })

  it('follows the arm below the start as well', () => {
    expect(liveArc(startMarking(70), 55)).toEqual({ from: 55, to: 70 })
  })

  it('is empty when nothing is being marked', () => {
    expect(liveArc(IDLE_MARKING, 95)).toBeNull()
  })
})
