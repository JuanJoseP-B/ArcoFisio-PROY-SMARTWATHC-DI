import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionsRepo } from './sessionsRepo'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'
import { MAX_SESSIONS } from './types'
import type { Session } from './types'

const make = (n: number): Session => ({
  id: `s${n}`,
  routineId: 'builtin-abduction-90',
  startedAt: new Date(Date.UTC(2026, 0, 1, 0, n)).toISOString(),
  endedAt: new Date(Date.UTC(2026, 0, 1, 0, n, 30)).toISOString(),
  maxAngle: 80 + (n % 10),
  hits: 1,
  overshoots: 0,
  painEntries: 0,
  reps: [{ peak: 90, held: true }],
})

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

describe('sessions repository', () => {
  it('is empty at first', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    expect(repo.list()).toEqual([])
    expect(repo.last()).toBeNull()
  })

  it('appends in order and keeps the data after reloading', () => {
    const backend = new FakeStorage()
    const repo = createSessionsRepo(createStorage(backend))
    repo.add(make(1))
    repo.add(make(2))
    const reloaded = createSessionsRepo(createStorage(backend))
    expect(reloaded.list().map((s) => s.id)).toEqual(['s1', 's2'])
    expect(reloaded.last()?.id).toBe('s2')
  })

  it('returns the most recent sessions newest first', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    ;[1, 2, 3, 4].forEach((n) => repo.add(make(n)))
    expect(repo.recent(2).map((s) => s.id)).toEqual(['s4', 's3'])
    expect(repo.recent(0)).toEqual([])
    expect(repo.recent(99)).toHaveLength(4)
  })

  it('keeps only the newest 200 sessions', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    for (let n = 1; n <= MAX_SESSIONS + 5; n++) repo.add(make(n))
    const all = repo.list()
    expect(all).toHaveLength(MAX_SESSIONS)
    expect(all[0]?.id).toBe('s6')
    expect(all.at(-1)?.id).toBe(`s${MAX_SESSIONS + 5}`)
  })

  it('rejects an invalid session', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    expect(repo.add({ ...make(1), maxAngle: 500 })).toBe(false)
    expect(repo.list()).toEqual([])
  })

  it('drops corrupt entries and keeps the valid ones', () => {
    const backend = new FakeStorage()
    backend.seed(
      'arcofisio:v1:sessions',
      JSON.stringify({ schema: 1, data: [make(1), { bad: 1 }] }),
    )
    expect(
      createSessionsRepo(createStorage(backend))
        .list()
        .map((s) => s.id),
    ).toEqual(['s1'])
  })

  it('clears the history', () => {
    const repo = createSessionsRepo(createStorage(new FakeStorage()))
    repo.add(make(1))
    repo.clear()
    expect(repo.list()).toEqual([])
  })
})
