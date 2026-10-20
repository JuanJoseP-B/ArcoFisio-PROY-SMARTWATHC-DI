import type { RepRecord } from './repetitions'

/** The part of a saved session the statistics read. A `Session` fits it as it is. */
export interface StatSession {
  readonly maxAngle: number
  readonly reps: readonly RepRecord[]
}

export type Trend = 'up' | 'down' | 'same'

/** How the best reach of a session compares with the session before it. */
export interface RangeChange {
  /** Whole degrees: positive when the range grew. */
  readonly delta: number
  readonly trend: Trend
}

export interface Summary {
  /** Best reach of the latest session, in whole degrees. */
  readonly max: number
  readonly reps: number
  readonly held: number
  /** Null when there is no session before the latest to compare with. */
  readonly change: RangeChange | null
}

export interface HistoryRow<S extends StatSession> {
  readonly session: S
  /** Against the session before this one; null for the oldest one on record. */
  readonly change: RangeChange | null
}

/** The minus sign (U+2212), as wide as the plus, so a column of changes lines up. */
const MINUS = '−'

/**
 * Change of range between two sessions. Both reaches are rounded first, so the delta is the
 * difference of the two numbers a person sees, never a degree off.
 */
export function rangeChange(latest: StatSession, previous: StatSession): RangeChange {
  const delta = Math.round(latest.maxAngle) - Math.round(previous.maxAngle)
  return { delta, trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same' }
}

/** "+12°", "−5°" or "0°": the sign always shows, except for no change. */
export function signedDegrees(delta: number): string {
  if (delta > 0) return `+${delta}°`
  if (delta < 0) return `${MINUS}${-delta}°`
  return '0°'
}

export const heldReps = (session: StatSession): number =>
  session.reps.filter((rep) => rep.held).length

/** The latest session's figures and its change against the one before. Newest session first. */
export function summarize(sessions: readonly StatSession[]): Summary | null {
  const latest = sessions[0]
  if (!latest) return null
  const previous = sessions[1]
  return {
    max: Math.round(latest.maxAngle),
    reps: latest.reps.length,
    held: heldReps(latest),
    change: previous ? rangeChange(latest, previous) : null,
  }
}

/**
 * The sessions as history rows, newest first, each with its change against the session just
 * before it. Pass one session more than `limit` to give the last row something to compare with.
 */
export function historyRows<S extends StatSession>(
  sessions: readonly S[],
  limit: number,
): HistoryRow<S>[] {
  return sessions.slice(0, limit).map((session, index) => {
    const previous = sessions[index + 1]
    return { session, change: previous ? rangeChange(session, previous) : null }
  })
}
