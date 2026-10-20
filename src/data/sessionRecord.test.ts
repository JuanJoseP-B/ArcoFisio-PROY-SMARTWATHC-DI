import { describe, expect, it } from 'vitest'
import type { SessionStats } from '../domain/sessionRun'
import { buildSession } from './sessionRecord'
import { createSessionsRepo } from './sessionsRepo'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'

const stats: SessionStats = {
  maxAngle: 118.4,
  hits: 3,
  overshoots: 1,
  painEntries: 2,
  reps: [
    { peak: 91, held: true },
    { peak: 88, held: false },
  ],
}
const start = new Date('2026-10-20T10:00:00.000Z')
const end = new Date('2026-10-20T10:07:30.000Z')

describe('buildSession', () => {
  it('copies the numbers and the times of the workout', () => {
    expect(buildSession({ id: 'builtin-abduction-90' }, stats, start, end, 'session-1')).toEqual({
      id: 'session-1',
      routineId: 'builtin-abduction-90',
      startedAt: '2026-10-20T10:00:00.000Z',
      endedAt: '2026-10-20T10:07:30.000Z',
      maxAngle: 118.4,
      hits: 3,
      overshoots: 1,
      painEntries: 2,
      reps: [
        { peak: 91, held: true },
        { peak: 88, held: false },
      ],
    })
  })

  it('makes an id of its own when none is given', () => {
    const a = buildSession({ id: 'r' }, stats, start, end)
    const b = buildSession({ id: 'r' }, stats, start, end)
    expect(a?.id).toMatch(/^session-/)
    expect(a?.id).not.toBe(b?.id)
  })

  it('keeps nothing for a workout where the arm never moved', () => {
    const idle: SessionStats = { maxAngle: 0, hits: 0, overshoots: 0, painEntries: 0, reps: [] }
    expect(buildSession({ id: 'r' }, idle, start, end)).toBeNull()
  })

  it('keeps a workout that moved the arm even if no repetition finished', () => {
    const partial: SessionStats = { ...stats, hits: 0, overshoots: 0, painEntries: 0, reps: [] }
    expect(buildSession({ id: 'r' }, partial, start, end)).not.toBeNull()
  })

  it('never ends before it started, whatever the clock did', () => {
    const session = buildSession({ id: 'r' }, stats, end, start)
    expect(session?.endedAt).toBe(session?.startedAt)
  })

  it('stays inside the 180 degree limit the data layer accepts', () => {
    expect(buildSession({ id: 'r' }, { ...stats, maxAngle: 183 }, start, end)?.maxAngle).toBe(180)
  })

  it('is accepted by the sessions repository', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    const session = buildSession({ id: 'r' }, stats, start, end)!
    expect(repo.add(session)).toBe(true)
    expect(repo.last()).toEqual(session)
  })

  it('does not share its repetition records with the stats', () => {
    const session = buildSession({ id: 'r' }, stats, start, end)!
    expect(session.reps[0]).not.toBe(stats.reps[0])
  })
})
