import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { calibrateAndSave } from '../sensors/calibrationFlow'
import type { CalibrationResult } from '../sensors/calibration'
import { getSensorKit } from '../sensors/kit'
import type { SensorKit } from '../sensors/kit'
import type { TrackerStatus } from '../sensors/tracker'
import type { PermissionResult, SensorMode } from '../sensors/types'
import { getDataLayer } from '../data'

export interface UseAngleOptions {
  kit?: SensorKit
  /** Start reading while the component is mounted. Defaults to true. */
  autoStart?: boolean
}

export interface AngleActions {
  /** Call from a tap: iOS only prompts for sensor access inside a user gesture. */
  requestPermission(): Promise<PermissionResult>
  calibrate(): Promise<CalibrationResult>
}

export interface UseAngle {
  angle: number | null
  status: TrackerStatus
  mode: SensorMode
  actions: AngleActions
}

const consumers = new WeakMap<SensorKit, number>()

function retain(kit: SensorKit): () => void {
  const count = (consumers.get(kit) ?? 0) + 1
  consumers.set(kit, count)
  if (count === 1) kit.tracker.start()
  return () => {
    const left = (consumers.get(kit) ?? 1) - 1
    consumers.set(kit, left)
    if (left === 0) kit.tracker.stop()
  }
}

export function useAngle(options: UseAngleOptions = {}): UseAngle {
  const { autoStart = true } = options
  const kit = options.kit ?? getSensorKit()
  const { tracker } = kit
  const { angle, status } = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot)

  useEffect(() => (autoStart ? retain(kit) : undefined), [autoStart, kit])

  const requestPermission = useCallback(() => tracker.requestPermission(), [tracker])
  const calibrate = useCallback(
    () => calibrateAndSave(tracker, getDataLayer().calibration),
    [tracker],
  )

  return { angle, status, mode: kit.mode, actions: { requestPermission, calibrate } }
}
