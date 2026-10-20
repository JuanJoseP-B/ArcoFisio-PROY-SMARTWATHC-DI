import type { MessageKey } from '../../i18n/translate'
import type { TrackerStatus } from '../../sensors/tracker'

export type NoticeAction = 'enable' | 'calibrate'

export interface Notice {
  message: MessageKey
  /** Button the person can press to get unstuck, if there is one. */
  action: NoticeAction | null
  /** Suggest the simulator, for devices that cannot give real readings. */
  simHint: boolean
}

/** What to tell the person when the sensor is not giving live angles; null when it is. */
export function noticeFor(status: TrackerStatus): Notice | null {
  switch (status) {
    case 'live':
      return null
    case 'no-data':
      return { message: 'sensor.noData', action: 'enable', simHint: false }
    case 'denied':
      return { message: 'sensor.denied', action: null, simHint: true }
    case 'unsupported':
      return { message: 'sensor.unsupported', action: null, simHint: true }
    case 'uncalibrated':
      return { message: 'sensor.uncalibrated', action: 'calibrate', simHint: false }
    case 'paused':
      return { message: 'sensor.paused', action: null, simHint: false }
    default:
      return { message: 'sensor.waiting', action: null, simHint: false }
  }
}
