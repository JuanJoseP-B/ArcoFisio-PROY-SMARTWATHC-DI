import { useCallback, useEffect, useRef, useState } from 'react'
import type { AngleActions } from '../../app/useAngle'
import type { MessageKey } from '../../i18n/translate'
import { failureMessage } from './measureFlow'

export interface CalibrateRun {
  /** The arm-down reading is in progress. */
  busy: boolean
  /** Why the last attempt failed; null when it worked or has not run. */
  failure: MessageKey | null
  /** Reads the reference; resolves true when it was saved. */
  run(): Promise<boolean>
}

/** Runs the arm-down calibration and keeps what the screen needs to show about it. */
export function useCalibrate(actions: AngleActions): CalibrateRun {
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<MessageKey | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const run = useCallback(async () => {
    setBusy(true)
    setFailure(null)
    const result = await actions.calibrate()
    if (alive.current) {
      setBusy(false)
      if (!result.ok) setFailure(failureMessage(result.reason))
    }
    return result.ok
  }, [actions])

  return { busy, failure, run }
}
