import {
  HOLD_MS,
  REP_RETURN_FLOOR_DEG,
  REP_RETURN_MARGIN_DEG,
  REP_START_HYSTERESIS_DEG,
} from './constants'
import { isOnTarget, isOvershoot } from './zones'

export interface RepRecord {
  readonly peak: number
  readonly held: boolean
}

export interface RepetitionConfig {
  readonly target: number
  readonly tolerance: number
}

export interface RepetitionState {
  readonly active: boolean
  readonly peak: number
  readonly reachedTarget: boolean
  readonly overshot: boolean
  readonly held: boolean
  readonly targetSince: number | null
  readonly reps: readonly RepRecord[]
  readonly hits: number
  readonly overshoots: number
  readonly maxAngle: number
}

export type RepetitionEvent =
  'rep-started' | 'target-reached' | 'overshoot' | 'held' | 'rep-completed'

export interface RepetitionStep {
  readonly state: RepetitionState
  readonly events: readonly RepetitionEvent[]
}

export interface RepetitionSample {
  readonly angle: number
  readonly tMs: number
}

export const createRepetitionState = (): RepetitionState => ({
  active: false,
  peak: 0,
  reachedTarget: false,
  overshot: false,
  held: false,
  targetSince: null,
  reps: [],
  hits: 0,
  overshoots: 0,
  maxAngle: 0,
})

export function repetitionWindow(config: RepetitionConfig) {
  const returnAngle = Math.min(
    Math.max(config.target - REP_RETURN_MARGIN_DEG, REP_RETURN_FLOOR_DEG),
    config.target / 2,
  )
  const startAngle = Math.max(
    Math.min(returnAngle + REP_START_HYSTERESIS_DEG, config.target - config.tolerance),
    returnAngle + 0.5,
  )
  return { returnAngle, startAngle }
}

export function stepRepetition(
  previous: RepetitionState,
  sample: RepetitionSample,
  config: RepetitionConfig,
): RepetitionStep {
  const { angle, tMs } = sample
  const { returnAngle, startAngle } = repetitionWindow(config)
  const events: RepetitionEvent[] = []
  let state: RepetitionState = { ...previous, maxAngle: Math.max(previous.maxAngle, angle) }

  if (!state.active) {
    if (angle < startAngle) return { state, events }
    state = { ...state, active: true, peak: angle }
    events.push('rep-started')
  }

  state = { ...state, peak: Math.max(state.peak, angle) }

  if (isOnTarget(angle, config.target, config.tolerance)) {
    if (!state.reachedTarget) {
      state = { ...state, reachedTarget: true, hits: state.hits + 1 }
      events.push('target-reached')
    }
    const since = state.targetSince ?? tMs
    state = { ...state, targetSince: since }
    if (!state.held && tMs - since >= HOLD_MS) {
      state = { ...state, held: true }
      events.push('held')
    }
  } else {
    state = { ...state, targetSince: null }
  }

  if (!state.overshot && isOvershoot(angle, config.target, config.tolerance)) {
    state = { ...state, overshot: true, overshoots: state.overshoots + 1 }
    events.push('overshoot')
  }

  if (angle <= returnAngle) {
    state = {
      ...state,
      active: false,
      peak: 0,
      reachedTarget: false,
      overshot: false,
      held: false,
      targetSince: null,
      reps: [...state.reps, { peak: state.peak, held: state.held }],
    }
    events.push('rep-completed')
  }

  return { state, events }
}
