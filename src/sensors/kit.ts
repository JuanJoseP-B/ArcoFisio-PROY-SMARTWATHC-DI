import { getDataLayer } from '../data'
import { restoreCalibration } from './calibrationFlow'
import type { CalibrationStore } from './calibrationFlow'
import { DeviceMotionSource } from './DeviceMotionSource'
import { SimulatedSource, gravityForAngle } from './SimulatedSource'
import { createAngleTracker } from './tracker'
import type { AngleTracker } from './tracker'
import type { AngleSource, SensorMode } from './types'
import { bindVisibility } from './visibility'

export interface SensorKit {
  readonly mode: SensorMode
  readonly source: AngleSource
  readonly tracker: AngleTracker
  /** Only present in simulator mode, so the dev control can drive the angle. */
  readonly simulated: SimulatedSource | null
}

export function isSimRequested(search: string): boolean {
  return new URLSearchParams(search).get('sim') === '1'
}

export function createSensorKit(mode: SensorMode, store: CalibrationStore): SensorKit {
  const simulated = mode === 'sim' ? new SimulatedSource() : null
  const source: AngleSource = simulated ?? new DeviceMotionSource()
  const tracker = createAngleTracker(source)

  const restored = restoreCalibration(tracker, store)
  // The simulator hangs at 0 degrees by construction, so it never needs the arm-down step.
  if (!restored && simulated) tracker.setCalibration({ gravityRef: gravityForAngle(0) })

  return { mode, source, tracker, simulated }
}

let shared: SensorKit | null = null

/** App-wide kit: simulator when the URL has ?sim=1, the phone sensor otherwise. */
export function getSensorKit(): SensorKit {
  if (!shared) {
    const mode = isSimRequested(window.location.search) ? 'sim' : 'device'
    shared = createSensorKit(mode, getDataLayer().calibration)
    bindVisibility(shared.tracker)
  }
  return shared
}

/** Forgets the arm-down reference after the saved data is erased: the phone must be calibrated again. */
export function forgetCalibration(kit: SensorKit): void {
  kit.tracker.setCalibration(kit.simulated ? { gravityRef: gravityForAngle(0) } : null)
}
