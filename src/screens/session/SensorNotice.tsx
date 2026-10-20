import { useI18n } from '../../app/useI18n'
import type { AngleActions } from '../../app/useAngle'
import type { Notice } from './noticeFor'
import styles from './SensorNotice.module.css'

interface SensorNoticeProps {
  notice: Notice
  actions: AngleActions
}

/**
 * Shown in place of the zone chip while the sensor gives no live angle. The buttons are the
 * interim way to grant access and calibrate; the Measure screen takes this over (stage 9).
 */
export function SensorNotice({ notice, actions }: SensorNoticeProps) {
  const { t } = useI18n()
  const press =
    notice.action === 'enable'
      ? () => void actions.requestPermission()
      : notice.action === 'calibrate'
        ? () => void actions.calibrate()
        : null

  return (
    <div className={styles.notice} data-part="sensor-notice" role="status">
      <div className={styles.message}>{t(notice.message)}</div>
      {notice.simHint ? <div className={styles.hint}>{t('sensor.simHint')}</div> : null}
      {press && notice.action ? (
        <button type="button" className={styles.button} onClick={press}>
          {t(notice.action === 'enable' ? 'sensor.enable' : 'sensor.calibrate')}
        </button>
      ) : null}
    </div>
  )
}
