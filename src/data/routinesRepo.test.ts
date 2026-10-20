import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoutinesRepo } from './routinesRepo'
import { SEED_ROUTINES } from './seeds'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'
import type { Routine } from './types'

const custom: Routine = {
  id: 'custom-1',
  name: { es: 'Mi rutina', en: 'My routine' },
  exercise: 'abduction',
  targetAngle: 100,
  tolerance: 3,
  reps: 6,
  sets: 2,
  restSec: 20,
  builtin: false,
}

const setup = () => {
  const backend = new FakeStorage()
  return { backend, repo: createRoutinesRepo(createStorage(backend)) }
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

describe('routines repository', () => {
  it('starts with the four seeds and writes them to storage', () => {
    const { backend, repo } = setup()
    expect(repo.list().map((r) => r.id)).toEqual(SEED_ROUTINES.map((r) => r.id))
    expect(backend.has('arcofisio:v1:routines')).toBe(true)
  })

  it('saves a custom routine and keeps it after reloading', () => {
    const { backend, repo } = setup()
    expect(repo.save(custom)).toBe(true)
    const reloaded = createRoutinesRepo(createStorage(backend))
    expect(reloaded.list()).toHaveLength(5)
    expect(reloaded.get('custom-1')).toEqual(custom)
  })

  it('updates an existing custom routine instead of duplicating it', () => {
    const { repo } = setup()
    repo.save(custom)
    repo.save({ ...custom, targetAngle: 110 })
    expect(repo.list()).toHaveLength(5)
    expect(repo.get('custom-1')?.targetAngle).toBe(110)
  })

  it('removes a custom routine', () => {
    const { repo } = setup()
    repo.save(custom)
    expect(repo.remove('custom-1')).toBe(true)
    expect(repo.get('custom-1')).toBeNull()
    expect(repo.remove('custom-1')).toBe(false)
  })

  it('never deletes or overwrites a built-in routine', () => {
    const { repo } = setup()
    expect(repo.remove('builtin-abduction-90')).toBe(false)
    expect(repo.save({ ...SEED_ROUTINES[0]!, targetAngle: 10 })).toBe(false)
    expect(repo.save({ ...custom, id: 'builtin-flexion-150' })).toBe(false)
    expect(repo.save({ ...custom, builtin: true })).toBe(false)
    expect(repo.get('builtin-abduction-90')?.targetAngle).toBe(90)
  })

  it('rejects an invalid routine', () => {
    const { repo } = setup()
    expect(repo.save({ ...custom, reps: 0 })).toBe(false)
    expect(repo.list()).toHaveLength(4)
  })

  it('returns copies so callers cannot mutate the seeds', () => {
    const { repo } = setup()
    const first = repo.list()[0]!
    first.name.es = 'cambiado'
    first.targetAngle = 1
    expect(repo.list()[0]?.name.es).toBe('Abducción 90°')
    expect(SEED_ROUTINES[0]?.targetAngle).toBe(90)
  })

  it('restores the seeds after corrupt data and drops tampered built-ins', () => {
    const { backend, repo } = setup()
    backend.seed('arcofisio:v1:routines', 'not json')
    expect(repo.list()).toHaveLength(4)

    const tampered = { ...SEED_ROUTINES[0]!, targetAngle: 1 }
    backend.seed(
      'arcofisio:v1:routines',
      JSON.stringify({ schema: 1, data: [tampered, { ...custom, id: 'x' }] }),
    )
    const list = repo.list()
    expect(list).toHaveLength(5)
    expect(list.find((r) => r.id === 'builtin-abduction-90')?.targetAngle).toBe(90)
  })

  it('returns null for an unknown id', () => {
    expect(setup().repo.get('nope')).toBeNull()
  })
})
