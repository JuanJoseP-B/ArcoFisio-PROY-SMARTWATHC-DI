import type { RepRecord } from '../domain/repetitions'
import type { Vec3 } from '../domain/vector'
import type { PainArc } from '../domain/zones'

export type { PainArc, RepRecord }

export const STORAGE_PREFIX = 'arcofisio:v1:'
export const SCHEMA_VERSION = 1
export const MAX_SESSIONS = 200

export type StorageKey = 'settings' | 'calibration' | 'painArc' | 'routines' | 'sessions'

export type Lang = 'es' | 'en'
export type Exercise = 'abduction' | 'flexion'
export type SensorMode = 'device' | 'sim'

export interface Settings {
  lang: Lang
  sound: boolean
  vibration: boolean
  targetDefault: number
  tolerance: number
  firstRunDone: boolean
}

export interface Calibration {
  gravityRef: Vec3
  calibratedAt: string
  sensorMode: SensorMode
}

export interface LocalizedName {
  es: string
  en: string
}

export interface Routine {
  id: string
  name: LocalizedName
  exercise: Exercise
  targetAngle: number
  tolerance: number
  reps: number
  sets: number
  restSec: number
  builtin: boolean
}

export interface Session {
  id: string
  routineId: string
  startedAt: string
  endedAt: string
  maxAngle: number
  hits: number
  overshoots: number
  painEntries: number
  reps: RepRecord[]
}
