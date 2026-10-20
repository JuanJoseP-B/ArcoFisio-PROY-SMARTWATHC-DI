import { describe, expect, it } from 'vitest'
import { createDataLayer } from './index'
import { FakeStorage } from './testStorage'
import { clampConfig, loadConfig, quickRoutineId, saveConfig } from './quickConfig'

const memoryBackend = () => new FakeStorage()

describe('quickRoutineId', () => {
  it('is one fixed id per exercise', () => {
    expect(quickRoutineId('abduction')).toBe('user-quick-abduction')
    expect(quickRoutineId('flexion')).toBe('user-quick-flexion')
  })
})

describe('clampConfig', () => {
  it('snaps the target and keeps the counts inside their limits', () => {
    expect(clampConfig({ target: 93, reps: 0, sets: 99, restSec: 9999 })).toEqual({
      target: 95,
      reps: 1,
      sets: 20,
      restSec: 600,
    })
  })

  it('rounds fractions and survives NaN', () => {
    expect(clampConfig({ target: 90, reps: 7.6, sets: Number.NaN, restSec: 30.2 })).toEqual({
      target: 90,
      reps: 8,
      sets: 1,
      restSec: 30,
    })
  })
})

describe('loadConfig', () => {
  it('starts from the saved target and the first built-in routine for the exercise', () => {
    const data = createDataLayer(memoryBackend())
    expect(loadConfig(data, 'abduction')).toEqual({ target: 90, reps: 10, sets: 3, restSec: 30 })
    expect(loadConfig(data, 'flexion')).toEqual({ target: 90, reps: 8, sets: 3, restSec: 45 })
  })

  it('uses the target remembered in settings', () => {
    const data = createDataLayer(memoryBackend())
    data.settings.update({ targetDefault: 120 })
    expect(loadConfig(data, 'abduction').target).toBe(120)
  })
})

describe('saveConfig', () => {
  it('stores a custom routine and remembers the target', () => {
    const data = createDataLayer(memoryBackend())
    const saved = saveConfig(data, 'flexion', { target: 135, reps: 6, sets: 4, restSec: 20 })

    expect(saved).toMatchObject({
      id: 'user-quick-flexion',
      exercise: 'flexion',
      targetAngle: 135,
      reps: 6,
      sets: 4,
      restSec: 20,
      builtin: false,
    })
    expect(saved?.name).toEqual({ es: 'Flexión personalizada', en: 'Custom flexion' })
    expect(data.routines.get('user-quick-flexion')).toEqual(saved)
    expect(data.settings.get().targetDefault).toBe(135)
  })

  it('uses the tolerance from settings', () => {
    const data = createDataLayer(memoryBackend())
    data.settings.update({ tolerance: 4 })
    const saved = saveConfig(data, 'abduction', { target: 90, reps: 10, sets: 3, restSec: 30 })
    expect(saved?.tolerance).toBe(4)
  })

  it('is what loadConfig returns afterwards, per exercise', () => {
    const data = createDataLayer(memoryBackend())
    saveConfig(data, 'abduction', { target: 100, reps: 5, sets: 2, restSec: 15 })
    saveConfig(data, 'flexion', { target: 150, reps: 9, sets: 3, restSec: 40 })

    expect(loadConfig(data, 'abduction')).toEqual({ target: 100, reps: 5, sets: 2, restSec: 15 })
    expect(loadConfig(data, 'flexion')).toEqual({ target: 150, reps: 9, sets: 3, restSec: 40 })
  })

  it('keeps the custom routine after a reload of the same storage', () => {
    const backend = memoryBackend()
    saveConfig(createDataLayer(backend), 'abduction', {
      target: 110,
      reps: 4,
      sets: 2,
      restSec: 10,
    })
    const reopened = createDataLayer(backend)
    expect(loadConfig(reopened, 'abduction').target).toBe(110)
    expect(reopened.settings.get().targetDefault).toBe(110)
  })

  it('updates the same routine instead of adding another', () => {
    const data = createDataLayer(memoryBackend())
    saveConfig(data, 'abduction', { target: 100, reps: 5, sets: 2, restSec: 15 })
    saveConfig(data, 'abduction', { target: 105, reps: 5, sets: 2, restSec: 15 })
    expect(data.routines.list().filter((r) => r.id === 'user-quick-abduction')).toHaveLength(1)
  })
})
