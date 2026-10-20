import { useEffect } from 'react'
import { useSessionRun } from '../../app/useSessionRun'
import { useI18n } from '../../app/useI18n'
import type { Feedback } from '../../feedback/feedback'
import type { SensorKit } from '../../sensors/kit'
import { createWakeLock } from '../../feedback/wakeLock'
import type { PainArc } from '../../domain/zones'
import type { Routine } from '../../data/types'
import { FeatherFan } from '../../ui/FeatherFan'
import { GoniometerRing } from '../../ui/GoniometerRing'
import { ZoneChip } from '../../ui/ZoneChip'
import { noticeFor } from './noticeFor'
import { SensorNotice } from './SensorNotice'
import styles from './Session.module.css'

interface SessionProps {
  routine: Routine
  painArc?: PainArc | null
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
  /** Sound and vibration for the zones; the session is silent without it. */
  feedback?: Feedback
  /** Opens Measure, offered when the sensor needs the person's attention. */
  onMeasure?: () => void
}

/**
 * Live session: the goniometer follows the arm, the chip says which zone it is in and the
 * counter tracks repetitions. Keeps the screen awake while it is open.
 */
export function Session({ routine, painArc = null, kit, feedback, onMeasure }: SessionProps) {
  const { t, lang } = useI18n()
  const run = useSessionRun({
    config: { target: routine.targetAngle, tolerance: routine.tolerance, painArc },
    ...(kit ? { kit } : {}),
    ...(feedback ? { feedback } : {}),
  })
  const { angle, status, zone, view } = run

  useEffect(() => {
    const lock = createWakeLock()
    void lock.acquire()
    return () => {
      void lock.release()
    }
  }, [])

  const notice = noticeFor(status)

  return (
    <div className={styles.session} data-part="session">
      <FeatherFan />
      <GoniometerRing angle={angle ?? 0} target={routine.targetAngle} zone={zone} />
      <div className={styles.readout}>
        <div className={styles.name}>{routine.name[lang]}</div>
        <div className={styles.angle} data-part="angle">
          {angle === null ? '--' : Math.round(angle)}°
        </div>
        {notice ? (
          <SensorNotice notice={notice} {...(onMeasure ? { onMeasure } : {})} />
        ) : zone ? (
          <ZoneChip zone={zone} label={t(`zone.${zone}`)} />
        ) : null}
        <div className={styles.reps} data-part="reps">
          <span>{t('session.reps')}</span>
          <span className={styles.repsCount}>
            {t('session.progress', { done: view.reps, total: routine.reps })}
          </span>
        </div>
      </div>
    </div>
  )
}
