import type { MessageKey } from '../../i18n/translate'
import type { CalibrationFailure } from '../../sensors/calibration'
import type { TrackerStatus } from '../../sensors/tracker'

/**
 * Where the person is in getting the sensor ready:
 * `enable` (ask for access), `calibrate` (arm down), `blocked` (no way forward without the
 * simulator) or `range` (live angle, ready to measure).
 */
export type MeasureStep = 'enable' | 'calibrate' | 'blocked' | 'range'

export function stepFor(status: TrackerStatus): MeasureStep {
  switch (status) {
    case 'live':
      return 'range'
    case 'uncalibrated':
      return 'calibrate'
    case 'denied':
    case 'unsupported':
      return 'blocked'
    default:
      return 'enable'
  }
}

/** What to say while the step is waiting on the person. */
export function messageFor(status: TrackerStatus): MessageKey {
  switch (status) {
    case 'uncalibrated':
      return 'measure.calibrate'
    case 'denied':
      return 'sensor.denied'
    case 'unsupported':
      return 'sensor.unsupported'
    case 'no-data':
      return 'sensor.noData'
    default:
      return 'measure.enable'
  }
}

/** Only worth suggesting the simulator when the real sensor cannot be used. */
export const suggestsSimulator = (status: TrackerStatus): boolean =>
  status === 'denied' || status === 'unsupported' || status === 'no-data'

export function failureMessage(reason: CalibrationFailure): MessageKey {
  return reason === 'unstable' ? 'measure.unstable' : 'measure.noReading'
}

/** Largest angle seen so far; ignores moments without a reading. */
export function trackMax(max: number | null, angle: number | null): number | null {
  if (angle === null) return max
  return max === null || angle > max ? angle : max
}
