import type { RepRecord } from './repetitions'
import type { PainArc } from './zones'

/** The part of a saved session the guide reads. A `Session` fits it as it is. */
export interface GuideSession {
  readonly routineId: string
  readonly maxAngle: number
  readonly overshoots: number
  readonly painEntries: number
  readonly reps: readonly RepRecord[]
}

export interface GuideInput {
  /** Saved sessions, the newest first. */
  readonly sessions: readonly GuideSession[]
  readonly painArc: PainArc | null
  /** The target of a routine, or undefined when it no longer exists. */
  readonly targetOf: (routineId: string) => number | undefined
}

export type GuideTipId =
  | 'first'
  | 'painTrend'
  | 'pain'
  | 'overshoot'
  | 'shortRange'
  | 'declined'
  | 'unheld'
  | 'improved'
  | 'steady'
  | 'markPain'
  | 'keepGoing'

export type GuideTone = 'warn' | 'info' | 'good'

export interface GuideTip {
  readonly id: GuideTipId
  readonly tone: GuideTone
  /** Numbers the message names, e.g. `{ count: 2 }` or `{ delta: 5 }`. */
  readonly params: Readonly<Record<string, number>>
}

/** How many tips the guide gives at once: the most important first. */
export const MAX_TIPS = 4
/** Sessions in a row with pain before the guide suggests talking to the physiotherapist. */
export const PAIN_TREND_SESSIONS = 3
/** Degrees the range must change between two sessions to be worth a word. */
export const RANGE_GAIN_DEG = 3
export const RANGE_LOSS_DEG = 5
/** Degrees short of the target the best reach may fall before the guide says so. */
export const SHORT_RANGE_DEG = 3
/** Share of repetitions that must be held for the guide not to ask for a longer hold. */
export const HELD_SHARE_MIN = 0.7

const tip = (id: GuideTipId, tone: GuideTone, params: Record<string, number> = {}): GuideTip => ({
  id,
  tone,
  params,
})

const heldCount = (session: GuideSession): number => session.reps.filter((rep) => rep.held).length

/**
 * Advice from the saved sessions and the painful arc, by local rules (no outside service).
 * The latest session sets the tips; the one before it gives the comparison. Warnings come
 * before encouragement, and there is always at least one tip.
 */
export function buildGuide(input: GuideInput): GuideTip[] {
  const { sessions, painArc, targetOf } = input
  const latest = sessions[0]
  const previous = sessions[1]
  const tips: GuideTip[] = []

  if (!latest) {
    tips.push(tip('first', 'info'))
    if (!painArc) tips.push(tip('markPain', 'info'))
    return tips
  }

  const recent = sessions.slice(0, PAIN_TREND_SESSIONS)
  const painTrend =
    recent.length === PAIN_TREND_SESSIONS && recent.every((session) => session.painEntries > 0)
  if (painTrend) tips.push(tip('painTrend', 'warn'))
  else if (latest.painEntries > 0) tips.push(tip('pain', 'warn', { count: latest.painEntries }))

  if (latest.overshoots > 0) tips.push(tip('overshoot', 'warn', { count: latest.overshoots }))

  const target = targetOf(latest.routineId)
  if (target !== undefined && latest.maxAngle < target - SHORT_RANGE_DEG) {
    tips.push(
      tip('shortRange', 'warn', {
        target,
        max: Math.round(latest.maxAngle),
      }),
    )
  }

  if (previous && previous.maxAngle - latest.maxAngle >= RANGE_LOSS_DEG) {
    tips.push(tip('declined', 'warn', { delta: Math.round(previous.maxAngle - latest.maxAngle) }))
  }

  const total = latest.reps.length
  const held = heldCount(latest)
  if (total > 0 && held / total < HELD_SHARE_MIN) tips.push(tip('unheld', 'info', { held, total }))

  if (previous && latest.maxAngle - previous.maxAngle >= RANGE_GAIN_DEG) {
    tips.push(tip('improved', 'good', { delta: Math.round(latest.maxAngle - previous.maxAngle) }))
  }

  const clean = total > 0 && held === total && latest.overshoots === 0 && latest.painEntries === 0
  if (clean) tips.push(tip('steady', 'good'))

  if (!painArc) tips.push(tip('markPain', 'info'))
  if (tips.length === 0) tips.push(tip('keepGoing', 'info'))

  return tips.slice(0, MAX_TIPS)
}
