import { useI18n } from '../../app/useI18n'
import type { Notice } from './noticeFor'
import styles from './SensorNotice.module.css'

interface SensorNoticeProps {
  notice: Notice
  /** Opens the Measure screen, where the sensor is allowed and calibrated. */
  onMeasure?: () => void
}

/**
 * Shown in place of the zone chip while the sensor gives no live angle. When the person can
 * fix it, one button leads to Measure, which does the permission and arm-down steps.
 */
export function SensorNotice({ notice, onMeasure }: SensorNoticeProps) {
  const { t } = useI18n()

  return (
    <div className={styles.notice} data-part="sensor-notice" role="status">
      <div className={styles.message}>{t(notice.message)}</div>
      {notice.simHint ? <div className={styles.hint}>{t('sensor.simHint')}</div> : null}
      {notice.action && onMeasure ? (
        <button type="button" className={styles.button} onClick={onMeasure}>
          {t('launcher.measure')}
        </button>
      ) : null}
    </div>
  )
}
