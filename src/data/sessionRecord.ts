import type { SessionStats } from '../domain/sessionRun'
import { createId } from './ids'
import type { Routine, Session } from './types'

/**
 * The record a finished workout is saved as. Null when the arm never moved, so nothing is
 * kept for a workout that was opened and closed straight away.
 */
export function buildSession(
  routine: Pick<Routine, 'id'>,
  stats: SessionStats,
  startedAt: Date,
  endedAt: Date,
  id: string = createId('session'),
): Session | null {
  if (stats.maxAngle <= 0 && stats.reps.length === 0) return null
  return {
    id,
    routineId: routine.id,
    startedAt: startedAt.toISOString(),
    // A clock that went back must not make the record invalid.
    endedAt: new Date(Math.max(startedAt.getTime(), endedAt.getTime())).toISOString(),
    maxAngle: Math.min(180, stats.maxAngle),
    hits: stats.hits,
    overshoots: stats.overshoots,
    painEntries: stats.painEntries,
    reps: stats.reps.map((rep) => ({ ...rep })),
  }
}
