import { createCalibrationRepo } from './calibrationRepo'
import type { CalibrationRepo } from './calibrationRepo'
import { createPainArcRepo } from './painArcRepo'
import type { PainArcRepo } from './painArcRepo'
import { createRoutinesRepo } from './routinesRepo'
import type { RoutinesRepo } from './routinesRepo'
import { createSessionsRepo } from './sessionsRepo'
import type { SessionsRepo } from './sessionsRepo'
import { createSettingsRepo } from './settingsRepo'
import type { SettingsRepo } from './settingsRepo'
import { createStorage } from './storage'
import type { StorageBackend, StorageClient } from './storage'

export interface DataLayer {
  storage: StorageClient
  settings: SettingsRepo
  calibration: CalibrationRepo
  painArc: PainArcRepo
  routines: RoutinesRepo
  sessions: SessionsRepo
  clearAll(): void
}

export function createDataLayer(backend?: StorageBackend | null): DataLayer {
  const storage = createStorage(backend)
  return {
    storage,
    settings: createSettingsRepo(storage),
    calibration: createCalibrationRepo(storage),
    painArc: createPainArcRepo(storage),
    routines: createRoutinesRepo(storage),
    sessions: createSessionsRepo(storage),
    clearAll: () => storage.clearAll(),
  }
}

let shared: DataLayer | null = null

export function getDataLayer(): DataLayer {
  shared ??= createDataLayer()
  return shared
}

export type { Calibration, Lang, PainArc, RepRecord, Routine, Session, Settings } from './types'
