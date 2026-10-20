import { ANGLE_MAX_DEG, ANGLE_MIN_DEG, MIN_PAIN_ARC_DEG } from './constants'
import type { PainArc } from './zones'

/**
 * Marking the painful arc by moving the arm: the person taps where the pain starts and taps
 * again where it ends. Between the two taps the band grows with the live angle.
 */
export type PainMarking =
  { readonly phase: 'idle' } | { readonly phase: 'marking'; readonly from: number }

export const IDLE_MARKING: PainMarking = { phase: 'idle' }

const clamp = (angle: number): number => Math.max(ANGLE_MIN_DEG, Math.min(ANGLE_MAX_DEG, angle))

/** Whole degrees inside the ring's range: the arc is saved and shown without decimals. */
const whole = (angle: number): number => Math.round(clamp(angle))

/** The pain starts here. */
export const startMarking = (angle: number): PainMarking => ({
  phase: 'marking',
  from: whole(angle),
})

/**
 * The pain ends here. Returns the arc with its ends in order, or null when it is narrower than
 * `MIN_PAIN_ARC_DEG` (a tap by mistake, or the arm did not move) or no marking was under way.
 */
export function finishMarking(marking: PainMarking, angle: number): PainArc | null {
  if (marking.phase !== 'marking') return null
  const end = whole(angle)
  const from = Math.min(marking.from, end)
  const to = Math.max(marking.from, end)
  return to - from >= MIN_PAIN_ARC_DEG ? { from, to } : null
}

/** The band to draw while marking: from where it began to the live angle, ends in order. */
export function liveArc(marking: PainMarking, angle: number): PainArc | null {
  if (marking.phase !== 'marking') return null
  const end = whole(angle)
  return { from: Math.min(marking.from, end), to: Math.max(marking.from, end) }
}
