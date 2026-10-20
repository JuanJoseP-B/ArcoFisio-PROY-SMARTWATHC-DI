import type { SessionStats } from './sessionRun'

/** What a routine asks for, as the workout needs it. */
export interface WorkoutPlan {
  readonly sets: number
  readonly reps: number
  readonly restSec: number
}

/** `set`: the arm is working. `rest`: between sets. `done`: nothing left to do. */
export type WorkoutPhase = 'set' | 'rest' | 'done'

export interface WorkoutState {
  readonly phase: WorkoutPhase
  /** 1-based. During a rest it is the set that just ended. */
  readonly set: number
  /** Time left of the rest, in ms; 0 means it is over and waiting to hand over. */
  readonly restLeftMs: number
  /** How a finished workout ended: every set done, or stopped by the person. */
  readonly outcome: 'completed' | 'stopped' | null
  /** Everything counted in the sets that already ended. */
  readonly totals: SessionStats
}

export const EMPTY_STATS: SessionStats = {
  maxAngle: 0,
  hits: 0,
  overshoots: 0,
  painEntries: 0,
  reps: [],
}

export const createWorkout = (): WorkoutState => ({
  phase: 'set',
  set: 1,
  restLeftMs: 0,
  outcome: null,
  totals: EMPTY_STATS,
})

export const mergeStats = (a: SessionStats, b: SessionStats): SessionStats => ({
  maxAngle: Math.max(a.maxAngle, b.maxAngle),
  hits: a.hits + b.hits,
  overshoots: a.overshoots + b.overshoots,
  painEntries: a.painEntries + b.painEntries,
  reps: [...a.reps, ...b.reps],
})

/** The set has all its repetitions. */
export const setIsComplete = (plan: WorkoutPlan, repsDone: number): boolean => repsDone >= plan.reps

/**
 * Ends the current set with what was counted in it (all the repetitions, or fewer when the
 * person skips ahead). The next set follows after the rest; the last set finishes the workout.
 * Ignored unless a set is on.
 */
export function completeSet(
  state: WorkoutState,
  plan: WorkoutPlan,
  counted: SessionStats,
): WorkoutState {
  if (state.phase !== 'set') return state
  const totals = mergeStats(state.totals, counted)
  if (state.set >= plan.sets) {
    return { ...state, phase: 'done', restLeftMs: 0, outcome: 'completed', totals }
  }
  if (plan.restSec <= 0) {
    return { ...state, set: state.set + 1, totals }
  }
  return { ...state, phase: 'rest', restLeftMs: plan.restSec * 1000, totals }
}

/** Runs the rest clock down by `dtMs`. Does nothing outside a rest. */
export function tickRest(state: WorkoutState, dtMs: number): WorkoutState {
  if (state.phase !== 'rest' || state.restLeftMs <= 0) return state
  return { ...state, restLeftMs: Math.max(0, state.restLeftMs - Math.max(0, dtMs)) }
}

export const restIsOver = (state: WorkoutState): boolean =>
  state.phase === 'rest' && state.restLeftMs <= 0

/** Leaves the rest, whether it ran out or was skipped, and starts the next set. */
export function endRest(state: WorkoutState): WorkoutState {
  if (state.phase !== 'rest') return state
  return { ...state, phase: 'set', set: state.set + 1, restLeftMs: 0 }
}

/**
 * The person ends the workout early. What the set in progress counted so far is kept; during a
 * rest there is nothing in progress.
 */
export function stopWorkout(state: WorkoutState, counted: SessionStats): WorkoutState {
  if (state.phase === 'done') return state
  const totals = state.phase === 'set' ? mergeStats(state.totals, counted) : state.totals
  return { ...state, phase: 'done', restLeftMs: 0, outcome: 'stopped', totals }
}

/** Seconds to show on the clock: the rest left, rounded up so it reads 0:00 only at the end. */
export const restSecondsLeft = (state: WorkoutState): number => Math.ceil(state.restLeftMs / 1000)

/** Repetitions counted so far across the sets that ended. */
export const repsCounted = (state: WorkoutState): number => state.totals.reps.length
