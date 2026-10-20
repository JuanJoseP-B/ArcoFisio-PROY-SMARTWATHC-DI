import { describe, expect, it } from 'vitest'
import { heldReps, historyRows, rangeChange, signedDegrees, summarize } from './stats'
import type { StatSession } from './stats'

const session = (maxAngle: number, held: boolean[] = [true, true]): StatSession => ({
  maxAngle,
  reps: held.map((h) => ({ peak: maxAngle, held: h })),
})

describe('rangeChange', () => {
  it('is positive when the range grew', () => {
    expect(rangeChange(session(142), session(130))).toEqual({ delta: 12, trend: 'up' })
  })

  it('is negative when the range fell', () => {
    expect(rangeChange(session(88), session(95))).toEqual({ delta: -7, trend: 'down' })
  })

  it('is zero when nothing changed', () => {
    expect(rangeChange(session(90), session(90))).toEqual({ delta: 0, trend: 'same' })
  })

  it('subtracts the rounded reaches, so it matches the numbers shown', () => {
    // 90.4 shows as 90 and 89.6 as 90: no change, not a 1° gain.
    expect(rangeChange(session(90.4), session(89.6)).delta).toBe(0)
    // 90.5 shows as 91 and 89.5 as 90.
    expect(rangeChange(session(90.5), session(89.5)).delta).toBe(1)
  })
})

describe('signedDegrees', () => {
  it('writes a plus for a gain', () => {
    expect(signedDegrees(12)).toBe('+12°')
  })

  it('writes the true minus sign for a loss', () => {
    expect(signedDegrees(-5)).toBe('−5°')
    expect(signedDegrees(-5)).not.toContain('-')
  })

  it('writes no sign for no change', () => {
    expect(signedDegrees(0)).toBe('0°')
  })
})

describe('heldReps', () => {
  it('counts the repetitions that were held', () => {
    expect(heldReps(session(90, [true, false, true]))).toBe(2)
    expect(heldReps(session(90, []))).toBe(0)
  })
})

describe('summarize', () => {
  it('has nothing to summarize without sessions', () => {
    expect(summarize([])).toBeNull()
  })

  it('gives the best reach, the repetitions and no change after a single session', () => {
    expect(summarize([session(92.4, [true, false, true])])).toEqual({
      max: 92,
      reps: 3,
      held: 2,
      change: null,
    })
  })

  it('compares the latest session with the one before it, not with older ones', () => {
    const found = summarize([session(100), session(90), session(140)])
    expect(found?.change).toEqual({ delta: 10, trend: 'up' })
  })

  it('shows a setback with its sign when the latest session fell short', () => {
    expect(summarize([session(85), session(97)])?.change).toEqual({ delta: -12, trend: 'down' })
  })
})

describe('historyRows', () => {
  it('compares every row with the session just before it', () => {
    const rows = historyRows([session(100), session(90), session(95)], 3)
    expect(rows.map((row) => row.change)).toEqual([
      { delta: 10, trend: 'up' },
      { delta: -5, trend: 'down' },
      null,
    ])
  })

  it('shows the improvement or setback of three sessions in a row', () => {
    // Oldest to newest: 80, 90, 85 -> newest first.
    const rows = historyRows([session(85), session(90), session(80)], 3)
    expect(rows[0]?.change?.delta).toBe(-5)
    expect(rows[1]?.change?.delta).toBe(10)
    expect(rows[2]?.change).toBeNull()
  })

  it('keeps only `limit` rows but still compares the last one with the session after the cut', () => {
    const rows = historyRows([session(100), session(90), session(70)], 2)
    expect(rows).toHaveLength(2)
    expect(rows[1]?.change?.delta).toBe(20)
  })

  it('has no rows without sessions', () => {
    expect(historyRows([], 5)).toEqual([])
  })

  it('keeps the whole session in each row', () => {
    const first = session(100)
    expect(historyRows([first], 1)[0]?.session).toBe(first)
  })
})
