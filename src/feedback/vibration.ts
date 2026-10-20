import type { VibrationPattern } from './cues'

/** The part of `navigator` the vibration needs; iOS Safari has no `vibrate`. */
export interface VibrationNavigator {
  vibrate?: (pattern: number | number[]) => boolean
}

export interface Vibration {
  /** False on devices without `navigator.vibrate` (all iPhones). */
  readonly supported: boolean
  /** Vibrates with the pattern; returns false when off, unsupported or refused. Never throws. */
  vibrate(pattern: VibrationPattern): boolean
  cancel(): void
  setEnabled(enabled: boolean): void
}

export function createVibration(nav: VibrationNavigator = navigator): Vibration {
  let enabled = true
  const vibrate = typeof nav.vibrate === 'function' ? nav.vibrate.bind(nav) : null

  const call = (pattern: number | number[]): boolean => {
    if (!vibrate) return false
    try {
      return vibrate(pattern)
    } catch {
      return false
    }
  }

  return {
    supported: vibrate !== null,
    vibrate: (pattern) => enabled && call([...pattern]),
    cancel() {
      call(0)
    },
    setEnabled(next) {
      enabled = next
      if (!next) call(0)
    },
  }
}
