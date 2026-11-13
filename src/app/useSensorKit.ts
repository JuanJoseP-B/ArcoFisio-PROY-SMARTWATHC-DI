import { useSyncExternalStore } from 'react'
import { getSensorKit, subscribeSensorKit } from '../sensors/kit'
import type { SensorKit } from '../sensors/kit'

/** The app-wide sensor kit; it changes when the person chooses simulated angles. */
export function useSensorKit(): SensorKit {
  return useSyncExternalStore(subscribeSensorKit, getSensorKit, getSensorKit)
}
