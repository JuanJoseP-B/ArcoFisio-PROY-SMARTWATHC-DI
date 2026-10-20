import { useEffect, useRef, useState } from 'react'
import { useFrameDelta } from '../../app/useFrameDelta'
import { useI18n } from '../../app/useI18n'
import { useSessionRun } from '../../app/useSessionRun'
import { useWakeLock } from '../../app/useWakeLock'
import { buildSession } from '../../data/sessionRecord'
import type { Routine, Session } from '../../data/types'
import type { PainArc } from '../../domain/zones'
import {
  completeSet,
  createWorkout,
  endRest,
  restIsOver,
  stopWorkout,
  tickRest,
} from '../../domain/workout'
import type { Feedback } from '../../feedback/feedback'
import type { SensorKit } from '../../sensors/kit'
import { IconButton } from '../../ui/IconButton'
import { SessionView } from '../session/Session'
import type { Control } from './Controls'
import { DoneView } from './DoneView'
import styles from './Player.module.css'
import { ProgressView } from './ProgressView'
import { RestView } from './RestView'

/** How long "¡Listo!" stays on the clock before the next set begins. */
export const READY_HOLD_MS = 1200

interface PlayerProps {
  routine: Routine
  painArc?: PainArc | null
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
  /** Sound and vibration for the zones; the workout is silent without it. */
  feedback?: Feedback
  /** Opens Measure, offered when the sensor needs the person's attention. */
  onMeasure?: () => void
  /** Called once when the workout ends, with the record to keep; null if the arm never moved. */
  onFinish?: (session: Session | null) => void
  /** The way out of the end screen. */
  onExit: () => void
}

/**
 * Plays a routine: each set is a live session, the rest between sets is the bow timer, and
 * the person can pause, skip ahead or finish at any moment. A set ends by itself when it has
 * all its repetitions. Pausing shows the progress ring (sheet 06).
 */
export function Player({
  routine,
  painArc = null,
  kit,
  feedback,
  onMeasure,
  onFinish,
  onExit,
}: PlayerProps) {
  const { t } = useI18n()
  const plan = { sets: routine.sets, reps: routine.reps, restSec: routine.restSec }
  const [workout, setWorkout] = useState(createWorkout)
  const [paused, setPaused] = useState(false)
  const readyMs = useRef(0)
  const [startedAt] = useState(() => new Date())
  const reported = useRef(false)

  const working = workout.phase === 'set' && !paused
  const run = useSessionRun({
    config: { target: routine.targetAngle, tolerance: routine.tolerance, painArc },
    ...(kit ? { kit } : {}),
    ...(feedback ? { feedback } : {}),
    paused: !working,
    repsGoal: plan.reps,
    onGoal: (counted) => setWorkout((w) => completeSet(w, plan, counted)),
  })
  useWakeLock()

  const resting = workout.phase === 'rest'
  const over = restIsOver(workout)

  // The rest clock runs on animation frames; "¡Listo!" holds a moment, then the next set starts.
  useFrameDelta(resting && !paused && !over, (dt) => setWorkout((w) => tickRest(w, dt)))
  useFrameDelta(resting && !paused && over, (dt) => {
    readyMs.current += dt
    if (readyMs.current >= READY_HOLD_MS) {
      readyMs.current = 0
      setWorkout(endRest)
    }
  })

  useEffect(() => {
    if (workout.phase !== 'done' || reported.current) return
    reported.current = true
    onFinish?.(buildSession(routine, workout.totals, startedAt, new Date()))
  })

  const stop = () => {
    setPaused(false)
    const counted = run.stats()
    setWorkout((w) => stopWorkout(w, counted))
  }

  const skip = () => {
    setPaused(false)
    if (workout.phase === 'rest') setWorkout(endRest)
    else if (workout.set >= plan.sets) stop()
    else {
      const counted = run.stats()
      run.reset()
      setWorkout((w) => completeSet(w, plan, counted))
    }
  }

  const controls = (playing: boolean): Control[] => [
    playing
      ? { icon: 'pause', label: t('player.pause'), onPress: () => setPaused(true) }
      : { icon: 'play', label: t('player.resume'), onPress: () => setPaused(false) },
    { icon: 'next', label: t('player.next'), onPress: skip },
    { icon: 'stop', label: t('player.stop'), onPress: stop },
  ]

  return (
    <div
      className={styles.player}
      data-part="player"
      data-phase={workout.phase}
      data-paused={paused}
    >
      {workout.phase === 'done' ? (
        <DoneView outcome={workout.outcome ?? 'stopped'} totals={workout.totals} onExit={onExit} />
      ) : resting ? (
        <RestView
          leftMs={workout.restLeftMs}
          totalMs={plan.restSec * 1000}
          over={over}
          paused={paused}
          controls={controls(!paused)}
        />
      ) : paused ? (
        <ProgressView
          done={run.view.reps}
          total={plan.reps}
          set={workout.set}
          sets={plan.sets}
          controls={controls(false)}
        />
      ) : (
        <>
          <SessionView
            routine={routine}
            run={run}
            painArc={painArc}
            {...(onMeasure ? { onMeasure } : {})}
            {...(plan.sets > 1
              ? { caption: t('player.set', { n: workout.set, total: plan.sets }) }
              : {})}
          />
          <div className={styles.dock}>
            <IconButton icon="pause" label={t('player.pause')} onPress={() => setPaused(true)} />
          </div>
        </>
      )}
    </div>
  )
}
