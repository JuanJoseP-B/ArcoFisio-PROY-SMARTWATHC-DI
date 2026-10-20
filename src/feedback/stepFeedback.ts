import type { Zone } from '../domain/zones'
import { CLICK_CUE, CLICK_STEP_DEG, SUCCESS_COOLDOWN_MS, ZONE_FEEDBACK } from './cues'
import type { Cue } from './cues'

export interface FeedbackState {
  readonly zone: Zone | null
  /** When the last enter or repeat cue of the current zone was played. */
  readonly lastCueAt: number | null
  /** Which 15-degree band the arm was in, to click each time it crosses into another. */
  readonly band: number | null
  readonly lastSuccessAt: number | null
}

export interface FeedbackInput {
  readonly zone: Zone | null
  readonly angle: number | null
  readonly tMs: number
}

export interface FeedbackStep {
  readonly state: FeedbackState
  readonly cue: Cue | null
}

export const initialFeedbackState: FeedbackState = {
  zone: null,
  lastCueAt: null,
  band: null,
  lastSuccessAt: null,
}

/**
 * Decides, from the zone and the clock, which cue (if any) to play now. It is pure: feed it
 * the latest zone and angle on every animation frame and it plays the enter cue once, repeats
 * the pulsing zones on their own interval and clicks every 15 degrees while far.
 */
export function stepFeedback(previous: FeedbackState, input: FeedbackInput): FeedbackStep {
  const { zone, angle, tMs } = input

  if (zone === null || angle === null) {
    return { state: { ...initialFeedbackState, lastSuccessAt: previous.lastSuccessAt }, cue: null }
  }

  const band = Math.floor(angle / CLICK_STEP_DEG)
  const config = ZONE_FEEDBACK[zone]
  let { lastCueAt, lastSuccessAt } = previous
  let cue: Cue | null = null

  if (zone !== previous.zone) {
    lastCueAt = tMs
    const cooling =
      zone === 'target' && lastSuccessAt !== null && tMs - lastSuccessAt < SUCCESS_COOLDOWN_MS
    if (config.enter && !cooling) {
      cue = config.enter
      if (zone === 'target') lastSuccessAt = tMs
    }
  } else if (
    config.repeat &&
    config.repeatMs !== null &&
    lastCueAt !== null &&
    tMs - lastCueAt >= config.repeatMs
  ) {
    cue = config.repeat
    lastCueAt = tMs
  }

  if (zone === 'far' && previous.band !== null && band !== previous.band) cue = CLICK_CUE

  return { state: { zone, lastCueAt, band, lastSuccessAt }, cue }
}
