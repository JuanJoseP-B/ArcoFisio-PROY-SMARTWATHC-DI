import { describe, expect, it } from 'vitest'
import type { SessionStats } from './sessionRun'
import {
  completeSet,
  createWorkout,
  endRest,
  mergeStats,
  repsCounted,
  restIsOver,
  restSecondsLeft,
  setIsComplete,
  stopWorkout,
  tickRest,
} from './workout'

const plan = { sets: 3, reps: 2, restSec: 30 }

const stats = (over: Partial<SessionStats> = {}): SessionStats => ({
  maxAngle: 90,
  hits: 2,
  overshoots: 1,
  painEntries: 0,
  reps: [
    { peak: 90, held: true },
    { peak: 88, held: false },
  ],
  ...over,
})

describe('workout', () => {
  it('starts on the first set with nothing counted', () => {
    const state = createWorkout()
    expect(state).toMatchObject({ phase: 'set', set: 1, outcome: null })
    expect(repsCounted(state)).toBe(0)
  })

  it('knows when a set has all its repetitions', () => {
    expect(setIsComplete(plan, 1)).toBe(false)
    expect(setIsComplete(plan, 2)).toBe(true)
    expect(setIsComplete(plan, 3)).toBe(true)
  })

  it('merges stats: the best angle, the sums and the repetitions in order', () => {
    const merged = mergeStats(
      stats(),
      stats({ maxAngle: 95, hits: 1, overshoots: 0, painEntries: 2 }),
    )
    expect(merged).toMatchObject({ maxAngle: 95, hits: 3, overshoots: 1, painEntries: 2 })
    expect(merged.reps).toHaveLength(4)
  })

  it('rests after a set that is not the last, for the routine rest time', () => {
    const state = completeSet(createWorkout(), plan, stats())
    expect(state).toMatchObject({ phase: 'rest', set: 1, restLeftMs: 30_000 })
    expect(repsCounted(state)).toBe(2)
  })

  it('goes straight to the next set when the routine has no rest', () => {
    const state = completeSet(createWorkout(), { ...plan, restSec: 0 }, stats())
    expect(state).toMatchObject({ phase: 'set', set: 2 })
  })

  it('finishes after the last set, completed', () => {
    let state = createWorkout()
    state = completeSet(state, plan, stats())
    state = endRest(state)
    state = completeSet(state, plan, stats())
    state = endRest(state)
    state = completeSet(state, plan, stats())
    expect(state).toMatchObject({ phase: 'done', set: 3, outcome: 'completed' })
    expect(state.totals.hits).toBe(6)
    expect(repsCounted(state)).toBe(6)
  })

  it('ignores completing a set while resting or done', () => {
    const resting = completeSet(createWorkout(), plan, stats())
    expect(completeSet(resting, plan, stats())).toBe(resting)
  })

  it('runs the rest clock down to zero and no further', () => {
    let state = completeSet(createWorkout(), plan, stats())
    state = tickRest(state, 10_000)
    expect(restSecondsLeft(state)).toBe(20)
    expect(restIsOver(state)).toBe(false)

    state = tickRest(state, 25_000)
    expect(state.restLeftMs).toBe(0)
    expect(restIsOver(state)).toBe(true)
    expect(tickRest(state, 1000)).toBe(state)
  })

  it('rounds the clock up so it reads 0:00 only when the rest is over', () => {
    const state = tickRest(completeSet(createWorkout(), plan, stats()), 29_900)
    expect(restSecondsLeft(state)).toBe(1)
  })

  it('does not tick backwards or outside a rest', () => {
    const resting = completeSet(createWorkout(), plan, stats())
    expect(tickRest(resting, -5000).restLeftMs).toBe(30_000)
    const working = createWorkout()
    expect(tickRest(working, 1000)).toBe(working)
  })

  it('leaves the rest early into the next set', () => {
    const resting = completeSet(createWorkout(), plan, stats())
    expect(endRest(resting)).toMatchObject({ phase: 'set', set: 2, restLeftMs: 0 })
    const working = createWorkout()
    expect(endRest(working)).toBe(working)
  })

  it('stopping keeps what the set in progress counted', () => {
    const state = stopWorkout(createWorkout(), stats({ reps: [{ peak: 91, held: true }] }))
    expect(state).toMatchObject({ phase: 'done', outcome: 'stopped' })
    expect(repsCounted(state)).toBe(1)
  })

  it('stopping during a rest keeps only the sets that ended', () => {
    const resting = completeSet(createWorkout(), plan, stats())
    const state = stopWorkout(resting, stats({ reps: [{ peak: 99, held: true }] }))
    expect(state).toMatchObject({ phase: 'done', outcome: 'stopped', restLeftMs: 0 })
    expect(repsCounted(state)).toBe(2)
  })

  it('stopping twice changes nothing', () => {
    const done = stopWorkout(createWorkout(), stats())
    expect(stopWorkout(done, stats())).toBe(done)
  })
})
