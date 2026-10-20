import { useI18n } from '../../app/useI18n'
import type { UseSessionRun } from '../../app/useSessionRun'
import type { Routine } from '../../data/types'
import { FeatherFan } from '../../ui/FeatherFan'
import { GoniometerRing } from '../../ui/GoniometerRing'
import { ZoneChip } from '../../ui/ZoneChip'
import { noticeFor } from './noticeFor'
import { SensorNotice } from './SensorNotice'
import styles from './Session.module.css'

interface SessionViewProps {
  routine: Routine
  run: UseSessionRun
  /** Opens Measure, offered when the sensor needs the person's attention. */
  onMeasure?: () => void
  /** Already translated line under the repetitions, e.g. "Serie 2 de 3". */
  caption?: string
}

/** What a live session shows: the goniometer, the zone chip and the repetition counter. */
export function SessionView({ routine, run, onMeasure, caption }: SessionViewProps) {
  const { t, lang } = useI18n()
  const { angle, status, zone, view } = run
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
        {caption ? (
          <div className={styles.caption} data-part="set-caption">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  )
}
