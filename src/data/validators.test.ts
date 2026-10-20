import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Calibration, Routine, Session, Settings } from './types'
import {
  parseCalibration,
  parsePainArc,
  parseRoutine,
  parseRoutines,
  parseSession,
  parseSessions,
  parseSettings,
} from './validators'

const DEFAULTS: Settings = {
  lang: 'es',
  sound: true,
  vibration: true,
  targetDefault: 90,
  tolerance: 2,
  firstRunDone: false,
}

const routine: Routine = {
  id: 'r1',
  name: { es: 'Abducción', en: 'Abduction' },
  exercise: 'abduction',
  targetAngle: 90,
  tolerance: 2,
  reps: 10,
  sets: 3,
  restSec: 30,
  builtin: false,
}

const session: Session = {
  id: 's1',
  routineId: 'r1',
  startedAt: '2026-10-19T10:00:00.000Z',
  endedAt: '2026-10-19T10:05:00.000Z',
  maxAngle: 92,
  hits: 3,
  overshoots: 1,
  painEntries: 0,
  reps: [{ peak: 90, held: true }],
}

const calibration: Calibration = {
  gravityRef: [0, 0, 1],
  calibratedAt: '2026-10-19T10:00:00.000Z',
  sensorMode: 'device',
}

let warn: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})
afterEach(() => warn.mockRestore())

describe('parseSettings', () => {
  it('accepts a complete valid object', () => {
    const value = { ...DEFAULTS, lang: 'en', sound: false, targetDefault: 120, tolerance: 3 }
    expect(parseSettings(value, DEFAULTS)).toEqual(value)
  })

  it('replaces each invalid field with its default', () => {
    const parsed = parseSettings(
      {
        lang: 'fr',
        sound: 'yes',
        vibration: false,
        targetDefault: 400,
        tolerance: 0,
        firstRunDone: 1,
      },
      DEFAULTS,
    )
    expect(parsed).toEqual({ ...DEFAULTS, vibration: false })
  })

  it('rejects non-objects', () => {
    for (const bad of [null, 5, 'x', [], undefined]) expect(parseSettings(bad, DEFAULTS)).toBeNull()
  })
})

describe('parseCalibration', () => {
  it('accepts a valid calibration', () => {
    expect(parseCalibration(calibration)).toEqual(calibration)
  })

  it.each([
    ['a short vector', { ...calibration, gravityRef: [0, 1] }],
    ['a non-numeric vector', { ...calibration, gravityRef: [0, 'a', 1] }],
    ['a zero vector', { ...calibration, gravityRef: [0, 0, 0] }],
    ['a non-finite vector', { ...calibration, gravityRef: [Infinity, 0, 1] }],
    ['a bad date', { ...calibration, calibratedAt: 'yesterday' }],
    ['a bad sensor mode', { ...calibration, sensorMode: 'gyro' }],
    ['a non-object', 'calibration'],
  ])('rejects %s', (_label, value) => {
    expect(parseCalibration(value)).toBeNull()
  })
})

describe('parsePainArc', () => {
  it('accepts an ordered range inside 0..180', () => {
    expect(parsePainArc({ from: 70, to: 110 })).toEqual({ from: 70, to: 110 })
    expect(parsePainArc({ from: 90, to: 90 })).toEqual({ from: 90, to: 90 })
  })

  it.each([
    [{ from: 110, to: 70 }],
    [{ from: -1, to: 50 }],
    [{ from: 10, to: 181 }],
    [{ from: '10', to: 50 }],
    [null],
  ])('rejects %j', (value) => {
    expect(parsePainArc(value)).toBeNull()
  })
})

describe('parseRoutine', () => {
  it('accepts a valid routine', () => {
    expect(parseRoutine(routine)).toEqual(routine)
  })

  it.each([
    ['an empty id', { ...routine, id: '' }],
    ['a missing name', { ...routine, name: undefined }],
    ['an empty english name', { ...routine, name: { es: 'a', en: '  ' } }],
    ['an over-long name', { ...routine, name: { es: 'x'.repeat(61), en: 'a' } }],
    ['an unknown exercise', { ...routine, exercise: 'rotation' }],
    ['a target above 180', { ...routine, targetAngle: 181 }],
    ['a zero tolerance', { ...routine, tolerance: 0 }],
    ['fractional reps', { ...routine, reps: 2.5 }],
    ['zero sets', { ...routine, sets: 0 }],
    ['a negative rest', { ...routine, restSec: -1 }],
    ['a non-boolean builtin', { ...routine, builtin: 'no' }],
  ])('rejects %s', (_label, value) => {
    expect(parseRoutine(value)).toBeNull()
  })
})

describe('parseSession', () => {
  it('accepts a valid session', () => {
    expect(parseSession(session)).toEqual(session)
  })

  it.each([
    ['an end before the start', { ...session, endedAt: '2026-10-19T09:00:00.000Z' }],
    ['a bad date', { ...session, startedAt: 'nope' }],
    ['a max angle over 180', { ...session, maxAngle: 200 }],
    ['negative hits', { ...session, hits: -1 }],
    ['fractional overshoots', { ...session, overshoots: 1.5 }],
    ['reps that are not an array', { ...session, reps: 'x' }],
    ['a malformed rep', { ...session, reps: [{ peak: 90 }] }],
    ['a rep peak out of range', { ...session, reps: [{ peak: 999, held: true }] }],
    ['a missing routine id', { ...session, routineId: '' }],
  ])('rejects %s', (_label, value) => {
    expect(parseSession(value)).toBeNull()
  })
})

describe('list parsers', () => {
  it('keep valid items, drop invalid ones and warn', () => {
    const routines = parseRoutines([routine, { nope: true }, { ...routine, id: 'r2' }])
    expect(routines?.map((r) => r.id)).toEqual(['r1', 'r2'])
    expect(warn).toHaveBeenCalledTimes(1)

    const sessions = parseSessions([session, 7])
    expect(sessions).toEqual([session])
  })

  it('return null when the value is not an array', () => {
    expect(parseRoutines({})).toBeNull()
    expect(parseSessions('x')).toBeNull()
  })

  it('return an empty list for an empty array', () => {
    expect(parseRoutines([])).toEqual([])
  })
})
