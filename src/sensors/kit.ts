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
let unbindVisibility: (() => void) | null = null
/** The person chose "simulated angles" on the sensor screen: it lasts until the page is reloaded. */
let simulationChosen = false
const listeners = new Set<() => void>()

function build(mode: SensorMode): SensorKit {
  const kit = createSensorKit(mode, getDataLayer().calibration)
  unbindVisibility?.()
  unbindVisibility = bindVisibility(kit.tracker)
  shared = kit
  return kit
}

/** App-wide kit: simulator when the URL has ?sim=1 or it was chosen on screen, the phone sensor otherwise. */
export function getSensorKit(): SensorKit {
  return (
    shared ??
    build(simulationChosen || isSimRequested(window.location.search) ? 'sim' : 'device')
  )
}

/**
 * Switches the app-wide kit to simulated angles, so the demo works with no sensor and no
 * permission. The simulator is calibrated at 0 degrees by construction. Screens that follow
 * `subscribeSensorKit` pick the new kit up at once.
 */
export function enableSimulation(): void {
  if (getSensorKit().mode === 'sim') return
  shared?.tracker.stop()
  simulationChosen = true
  build('sim')
  for (const listener of listeners) listener()
}

/** Lets React follow a change of the app-wide kit. */
export function subscribeSensorKit(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Test helper: forgets the shared kit and the on-screen choice of simulation. */
export function resetSensorKit(): void {
  shared?.tracker.stop()
  unbindVisibility?.()
  unbindVisibility = null
  shared = null
  simulationChosen = false
}

/** Forgets the arm-down reference after the saved data is erased: the phone must be calibrated again. */
export function forgetCalibration(kit: SensorKit): void {
  kit.tracker.setCalibration(kit.simulated ? { gravityRef: gravityForAngle(0) } : null)
}
