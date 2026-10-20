import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../domain/constants'
import { normalize } from '../domain/vector'
import type { Vec3 } from '../domain/vector'
import type {
  Calibration,
  Exercise,
  Lang,
  PainArc,
  RepRecord,
  Routine,
  SensorMode,
  Session,
  Settings,
} from './types'

export const LIMITS = {
  tolerance: { min: 0.5, max: 10 },
  reps: { min: 1, max: 99 },
  sets: { min: 1, max: 20 },
  restSec: { min: 0, max: 600 },
  nameLength: 60,
} as const

const LANGS: readonly Lang[] = ['es', 'en']
const EXERCISES: readonly Exercise[] = ['abduction', 'flexion']
const SENSOR_MODES: readonly SensorMode[] = ['device', 'sim']

type Dict = Record<string, unknown>

const isRecord = (value: unknown): value is Dict =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNumberIn = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

const isIntegerIn = (value: unknown, min: number, max: number): value is number =>
  isNumberIn(value, min, max) && Number.isInteger(value)

const isAngle = (value: unknown): value is number => isNumberIn(value, ANGLE_MIN_DEG, ANGLE_MAX_DEG)

const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value))

const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value)

const isName = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && value.length <= LIMITS.nameLength

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value !== ''

function asVec3(value: unknown): Vec3 | null {
  if (!Array.isArray(value) || value.length !== 3) return null
  if (!value.every((n) => typeof n === 'number' && Number.isFinite(n))) return null
  const vector: Vec3 = [value[0] as number, value[1] as number, value[2] as number]
  return normalize(vector) === null ? null : vector
}

export function parseSettings(value: unknown, defaults: Settings): Settings | null {
  if (!isRecord(value)) return null
  return {
    lang: isOneOf(value.lang, LANGS) ? value.lang : defaults.lang,
    sound: typeof value.sound === 'boolean' ? value.sound : defaults.sound,
    vibration: typeof value.vibration === 'boolean' ? value.vibration : defaults.vibration,
    targetDefault: isAngle(value.targetDefault) ? value.targetDefault : defaults.targetDefault,
    tolerance: isNumberIn(value.tolerance, LIMITS.tolerance.min, LIMITS.tolerance.max)
      ? value.tolerance
      : defaults.tolerance,
    firstRunDone:
      typeof value.firstRunDone === 'boolean' ? value.firstRunDone : defaults.firstRunDone,
  }
}

export function parseCalibration(value: unknown): Calibration | null {
  if (!isRecord(value)) return null
  const gravityRef = asVec3(value.gravityRef)
  if (!gravityRef || !isIsoDate(value.calibratedAt) || !isOneOf(value.sensorMode, SENSOR_MODES)) {
    return null
  }
  return { gravityRef, calibratedAt: value.calibratedAt, sensorMode: value.sensorMode }
}

export function parsePainArc(value: unknown): PainArc | null {
  if (!isRecord(value)) return null
  const { from, to } = value
  if (!isAngle(from) || !isAngle(to) || from > to) return null
  return { from, to }
}

export function parseRoutine(value: unknown): Routine | null {
  if (!isRecord(value) || !isRecord(value.name)) return null
  const name = value.name
  if (!isName(name.es) || !isName(name.en)) return null

  if (
    !isNonEmptyString(value.id) ||
    !isOneOf(value.exercise, EXERCISES) ||
    !isAngle(value.targetAngle) ||
    !isNumberIn(value.tolerance, LIMITS.tolerance.min, LIMITS.tolerance.max) ||
    !isIntegerIn(value.reps, LIMITS.reps.min, LIMITS.reps.max) ||
    !isIntegerIn(value.sets, LIMITS.sets.min, LIMITS.sets.max) ||
    !isIntegerIn(value.restSec, LIMITS.restSec.min, LIMITS.restSec.max) ||
    typeof value.builtin !== 'boolean'
  ) {
    return null
  }

  return {
    id: value.id,
    name: { es: name.es, en: name.en },
    exercise: value.exercise,
    targetAngle: value.targetAngle,
    tolerance: value.tolerance,
    reps: value.reps,
    sets: value.sets,
    restSec: value.restSec,
    builtin: value.builtin,
  }
}

function parseRep(value: unknown): RepRecord | null {
  if (!isRecord(value) || !isAngle(value.peak) || typeof value.held !== 'boolean') return null
  return { peak: value.peak, held: value.held }
}

export function parseSession(value: unknown): Session | null {
  if (!isRecord(value)) return null
  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.routineId) ||
    !isIsoDate(value.startedAt) ||
    !isIsoDate(value.endedAt) ||
    Date.parse(value.endedAt) < Date.parse(value.startedAt) ||
    !isAngle(value.maxAngle) ||
    !isIntegerIn(value.hits, 0, Number.MAX_SAFE_INTEGER) ||
    !isIntegerIn(value.overshoots, 0, Number.MAX_SAFE_INTEGER) ||
    !isIntegerIn(value.painEntries, 0, Number.MAX_SAFE_INTEGER) ||
    !Array.isArray(value.reps)
  ) {
    return null
  }

  const reps: RepRecord[] = []
  for (const item of value.reps) {
    const rep = parseRep(item)
    if (!rep) return null
    reps.push(rep)
  }

  return {
    id: value.id,
    routineId: value.routineId,
    startedAt: value.startedAt,
    endedAt: value.endedAt,
    maxAngle: value.maxAngle,
    hits: value.hits,
    overshoots: value.overshoots,
    painEntries: value.painEntries,
    reps,
  }
}

function parseList<T>(value: unknown, parseItem: (item: unknown) => T | null, label: string) {
  if (!Array.isArray(value)) return null
  const items: T[] = []
  value.forEach((item, index) => {
    const parsed = parseItem(item)
    if (parsed) items.push(parsed)
    else console.warn(`[arcofisio] dropping invalid ${label} at index ${index}`)
  })
  return items
}

export const parseRoutines = (value: unknown): Routine[] | null =>
  parseList(value, parseRoutine, 'routine')

export const parseSessions = (value: unknown): Session[] | null =>
  parseList(value, parseSession, 'session')
