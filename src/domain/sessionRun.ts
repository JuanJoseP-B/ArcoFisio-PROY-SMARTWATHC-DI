import { createRepetitionState, stepRepetition } from './repetitions'
import type { RepetitionEvent, RepetitionSample, RepetitionState, RepRecord } from './repetitions'
import { classifyZone } from './zones'
import type { AngleZone, PainArc } from './zones'

export interface SessionRunConfig {
  readonly target: number
  readonly tolerance: number
  readonly painArc: PainArc | null
}

export interface SessionRunState {
  readonly rep: RepetitionState
  /** Zone of the previous sample; null before the first one. */
  readonly zone: AngleZone | null
  readonly painEntries: number
}

export interface SessionRunStep {
  readonly state: SessionRunState
  readonly zone: AngleZone
  readonly events: readonly RepetitionEvent[]
  readonly enteredPain: boolean
}

export interface SessionStats {
  readonly maxAngle: number
  readonly hits: number
  readonly overshoots: number
  readonly painEntries: number
  readonly reps: readonly RepRecord[]
}

export const createSessionRunState = (): SessionRunState => ({
  rep: createRepetitionState(),
  zone: null,
  painEntries: 0,
})

/**
 * One tick of a live session: classifies the angle, advances the repetition machine and
 * counts each time the arm enters the painful arc. Call it with the latest angle on every
 * frame, not only when the angle changes, so a held position still reaches the 1 s hold.
 */
export function stepSessionRun(
  previous: SessionRunState,
  sample: RepetitionSample,
  config: SessionRunConfig,
): SessionRunStep {
  const zone = classifyZone(sample.angle, config.target, config.tolerance, config.painArc)
  const { state: rep, events } = stepRepetition(previous.rep, sample, config)
  const enteredPain = zone === 'pain' && previous.zone !== 'pain'

  return {
    state: {
      rep,
      zone,
      painEntries: previous.painEntries + (enteredPain ? 1 : 0),
    },
    zone,
    events,
    enteredPain,
  }
}

/** Numbers a finished session is saved with (see the `sessions` data model). */
export const sessionStats = (state: SessionRunState): SessionStats => ({
  maxAngle: state.rep.maxAngle,
  hits: state.rep.hits,
  overshoots: state.rep.overshoots,
  painEntries: state.painEntries,
  reps: state.rep.reps,
})
