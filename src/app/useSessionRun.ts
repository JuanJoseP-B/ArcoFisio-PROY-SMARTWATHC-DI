import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createSessionRunState,
  pauseSessionRun,
  sessionStats,
  stepSessionRun,
} from '../domain/sessionRun'
import type { SessionRunConfig, SessionRunState, SessionStats } from '../domain/sessionRun'
import type { AngleZone } from '../domain/zones'
import type { Feedback } from '../feedback/feedback'
import type { SensorKit } from '../sensors/kit'
import { useAngle } from './useAngle'
import type { UseAngle } from './useAngle'

export interface SessionView {
  zone: AngleZone | null
  /** Repetitions completed (returned to the start position). */
  reps: number
  hits: number
  overshoots: number
  painEntries: number
  maxAngle: number
}

export interface UseSessionRun extends UseAngle {
  /** Zone of the latest sample; null while the sensor is not live. */
  zone: AngleZone | null
  view: SessionView
  /** Numbers to save when the session ends. */
  stats(): SessionStats
  reset(): void
}

export interface UseSessionRunOptions {
  config: SessionRunConfig
  kit?: SensorKit
  /** Sound and vibration driven by the same frame tick; stopped when readings stop. */
  feedback?: Feedback
}

const EMPTY_VIEW: SessionView = {
  zone: null,
  reps: 0,
  hits: 0,
  overshoots: 0,
  painEntries: 0,
  maxAngle: 0,
}

const viewOf = (state: SessionRunState): SessionView => ({
  zone: state.zone,
  reps: state.rep.reps.length,
  hits: state.rep.hits,
  overshoots: state.rep.overshoots,
  painEntries: state.painEntries,
  maxAngle: state.rep.maxAngle,
})

const sameView = (a: SessionView, b: SessionView): boolean =>
  a.zone === b.zone &&
  a.reps === b.reps &&
  a.hits === b.hits &&
  a.overshoots === b.overshoots &&
  a.painEntries === b.painEntries &&
  a.maxAngle === b.maxAngle

/**
 * Live session: follows the sensor angle and, once per animation frame, advances the zone and
 * repetition machine with the latest angle. Ticking every frame (not only when the angle
 * changes) lets a steady hold on the target reach its 1 s.
 */
export function useSessionRun({ config, kit, feedback }: UseSessionRunOptions): UseSessionRun {
  const angleState = useAngle(kit ? { kit } : {})
  const { angle, status } = angleState

  const angleRef = useRef<number | null>(angle)
  const configRef = useRef(config)
  const feedbackRef = useRef(feedback)
  const runRef = useRef<SessionRunState>(createSessionRunState())
  const [view, setView] = useState<SessionView>(EMPTY_VIEW)

  useEffect(() => {
    angleRef.current = angle
    configRef.current = config
    feedbackRef.current = feedback
  })

  useEffect(() => {
    if (status !== 'live') {
      runRef.current = pauseSessionRun(runRef.current)
      feedbackRef.current?.stop()
      return undefined
    }

    let handle = 0
    const tick = (now: number) => {
      const current = angleRef.current
      if (current !== null) {
        const step = stepSessionRun(runRef.current, { angle: current, tMs: now }, configRef.current)
        runRef.current = step.state
        feedbackRef.current?.tick({ zone: step.zone, angle: current, tMs: now })
        const next = viewOf(runRef.current)
        setView((previous) => (sameView(previous, next) ? previous : next))
      }
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(handle)
      feedbackRef.current?.stop()
    }
  }, [status])

  const stats = useCallback(() => sessionStats(runRef.current), [])
  const reset = useCallback(() => {
    runRef.current = createSessionRunState()
    setView(EMPTY_VIEW)
  }, [])

  return { ...angleState, zone: status === 'live' ? view.zone : null, view, stats, reset }
}
