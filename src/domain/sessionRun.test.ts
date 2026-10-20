import { describe, expect, it } from 'vitest'
import { HOLD_MS } from './constants'
import { createSessionRunState, sessionStats, stepSessionRun } from './sessionRun'
import type { SessionRunConfig, SessionRunState } from './sessionRun'

const config: SessionRunConfig = { target: 90, tolerance: 2, painArc: null }
const withPain: SessionRunConfig = { ...config, painArc: { from: 70, to: 85 } }

function run(angles: readonly [angle: number, tMs: number][], cfg = config) {
  let state: SessionRunState = createSessionRunState()
  const steps = angles.map(([angle, tMs]) => {
    const step = stepSessionRun(state, { angle, tMs }, cfg)
    state = step.state
    return step
  })
  return { state, steps }
}

describe('stepSessionRun', () => {
  it('starts empty', () => {
    const state = createSessionRunState()
    expect(state.zone).toBeNull()
    expect(state.painEntries).toBe(0)
    expect(sessionStats(state)).toEqual({
      maxAngle: 0,
      hits: 0,
      overshoots: 0,
      painEntries: 0,
      reps: [],
    })
  })

  it('classifies each sample against the target', () => {
    const { steps } = run([
      [10, 0],
      [75, 16],
      [86, 32],
      [90, 48],
      [95, 64],
    ])
    expect(steps.map((s) => s.zone)).toEqual(['far', 'approach', 'near', 'target', 'overshoot'])
  })

  it('reports repetition events from the machine', () => {
    const { steps } = run([
      [70, 0],
      [90, 16],
    ])
    expect(steps[0]?.events).toContain('rep-started')
    expect(steps[1]?.events).toContain('target-reached')
  })

  it('counts a held repetition only when the same angle keeps being sampled for 1 s', () => {
    const { state, steps } = run([
      [90, 0],
      [90, HOLD_MS - 1],
      [90, HOLD_MS],
      [10, HOLD_MS + 100],
    ])
    expect(steps[1]?.events).not.toContain('held')
    expect(steps[2]?.events).toContain('held')
    expect(state.rep.reps).toEqual([{ peak: 90, held: true }])
  })

  it('counts every entry into the painful arc once, not every sample inside it', () => {
    const { state, steps } = run(
      [
        [60, 0],
        [72, 16],
        [75, 32],
        [80, 48],
        [60, 64],
        [74, 80],
      ],
      withPain,
    )
    expect(steps.map((s) => s.enteredPain)).toEqual([false, true, false, false, false, true])
    expect(state.painEntries).toBe(2)
  })

  it('does not count pain when no arc is defined', () => {
    const { state } = run([
      [72, 0],
      [80, 16],
    ])
    expect(state.painEntries).toBe(0)
  })

  it('lets the target win when it lies inside the painful arc', () => {
    const { steps } = run([[90, 0]], { target: 90, tolerance: 2, painArc: { from: 70, to: 110 } })
    expect(steps[0]?.zone).toBe('target')
    expect(steps[0]?.enteredPain).toBe(false)
  })

  it('summarizes the session for saving', () => {
    const { state } = run(
      [
        [60, 0],
        [92, 16],
        [96, 32],
        [10, 48],
      ],
      withPain,
    )
    expect(sessionStats(state)).toMatchObject({
      maxAngle: 96,
      hits: 1,
      overshoots: 1,
      painEntries: 0,
    })
    expect(sessionStats(state).reps).toHaveLength(1)
  })
})
