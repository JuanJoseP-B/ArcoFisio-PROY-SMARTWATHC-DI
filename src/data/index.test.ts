import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDataLayer, getDataLayer } from '.'
import { createId } from './ids'
import { FakeStorage } from './testStorage'

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
})
afterEach(() => vi.restoreAllMocks())

describe('data layer', () => {
  it('returns every repository to its defaults after clearAll', () => {
    const backend = new FakeStorage()
    backend.seed('other-app:key', 'keep')
    const data = createDataLayer(backend)

    data.settings.update({ lang: 'es', sound: false, firstRunDone: true })
    data.calibration.save({
      gravityRef: [0, 0, 1],
      calibratedAt: '2026-10-19T10:00:00.000Z',
      sensorMode: 'sim',
    })
    data.painArc.set({ from: 70, to: 110 })
    data.routines.save({
      id: 'c1',
      name: { es: 'a', en: 'b' },
      exercise: 'flexion',
      targetAngle: 80,
      tolerance: 2,
      reps: 5,
      sets: 1,
      restSec: 10,
      builtin: false,
    })
    data.sessions.add({
      id: 's1',
      routineId: 'c1',
      startedAt: '2026-10-19T10:00:00.000Z',
      endedAt: '2026-10-19T10:01:00.000Z',
      maxAngle: 80,
      hits: 1,
      overshoots: 0,
      painEntries: 0,
      reps: [],
    })

    data.clearAll()

    expect(data.settings.get()).toMatchObject({ lang: 'en', sound: true, firstRunDone: false })
    expect(data.calibration.get()).toBeNull()
    expect(data.painArc.get()).toBeNull()
    expect(data.routines.list()).toHaveLength(4)
    expect(data.sessions.list()).toEqual([])
    expect(backend.has('other-app:key')).toBe(true)
  })

  it('works end to end with storage that refuses everything', () => {
    const data = createDataLayer(null)
    expect(data.storage.isFallback()).toBe(true)
    data.settings.update({ vibration: false })
    data.painArc.set({ from: 10, to: 20 })
    expect(data.settings.get().vibration).toBe(false)
    expect(data.painArc.get()).toEqual({ from: 10, to: 20 })
    data.clearAll()
    expect(data.painArc.get()).toBeNull()
  })

  it('shares one instance through getDataLayer', () => {
    expect(getDataLayer()).toBe(getDataLayer())
  })
})

describe('createId', () => {
  it('prefixes and generates distinct ids', () => {
    const a = createId('routine')
    expect(a.startsWith('routine-')).toBe(true)
    expect(createId('routine')).not.toBe(a)
  })

  it('falls back when crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', undefined)
    try {
      expect(createId('s')).toMatch(/^s-[a-z0-9]+-[a-z0-9]+$/)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
