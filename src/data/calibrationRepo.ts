import type { StorageClient } from './storage'
import type { Calibration } from './types'
import { parseCalibration } from './validators'

export interface CalibrationRepo {
  get(): Calibration | null
  save(calibration: Calibration): boolean
  clear(): void
}

export function createCalibrationRepo(storage: StorageClient): CalibrationRepo {
  return {
    get: () => storage.read('calibration', parseCalibration),
    save(calibration) {
      const valid = parseCalibration(calibration)
      if (!valid) return false
      storage.write('calibration', valid)
      return true
    },
    clear: () => storage.remove('calibration'),
  }
}
