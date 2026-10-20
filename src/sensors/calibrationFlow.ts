import type { Calibration } from '../data/types'
import { toCalibration } from './calibration'
import type { CalibrationOptions, CalibrationResult } from './calibration'
import type { AngleTracker } from './tracker'

export interface CalibrationStore {
  get(): Calibration | null
  save(calibration: Calibration): boolean
}

/** Loads the saved reference, but only if it was taken with the same kind of sensor. */
export function restoreCalibration(tracker: AngleTracker, store: CalibrationStore): boolean {
  const saved = store.get()
  if (!saved || saved.sensorMode !== tracker.mode) return false
  tracker.setCalibration({ gravityRef: saved.gravityRef })
  return true
}

/** "Arm down" step: measures the reference gravity and persists it on success. */
export async function calibrateAndSave(
  tracker: AngleTracker,
  store: CalibrationStore,
  options?: CalibrationOptions,
): Promise<CalibrationResult> {
  const result = await tracker.calibrate(options)
  if (result.ok) store.save(toCalibration(result.gravityRef, tracker.mode))
  return result
}
