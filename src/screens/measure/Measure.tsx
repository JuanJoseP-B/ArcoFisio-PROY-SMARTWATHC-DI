import { useState } from 'react'
import { useAngle } from '../../app/useAngle'
import { useI18n } from '../../app/useI18n'
import type { SensorKit } from '../../sensors/kit'
import { BackButton } from '../../ui/BackButton'
import { FeatherFan } from '../../ui/FeatherFan'
import { GoniometerRing } from '../../ui/GoniometerRing'
import { IconButton } from '../../ui/IconButton'
import { useNav } from '../navigation/useNav'
import styles from './Measure.module.css'
import { stepFor, trackMax } from './measureFlow'
import { SensorSteps } from './SensorSteps'
import { useCalibrate } from './useCalibrate'

interface MeasureProps {
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
}

/**
 * Measure range. Until the angle is live it walks through the two steps: allow the sensor,
 * then "arm down". Once live it shows the angle on the ring, with the largest one reached
 * marked on it, and lets the person reset that maximum or calibrate again.
 */
export function Measure({ kit }: MeasureProps) {
  const { t } = useI18n()
  const nav = useNav()
  const { angle, status, actions } = useAngle(kit ? { kit } : {})
  const calibration = useCalibrate(actions)
  const [max, setMax] = useState<number | null>(null)

  const seen = trackMax(max, angle)
  if (seen !== max) setMax(seen)

  if (stepFor(status) !== 'range') {
    return (
      <div className={styles.steps} data-part="measure" data-mode="steps">
        <BackButton label={t('nav.back')} onBack={nav.back} />
        <SensorSteps status={status} actions={actions} />
      </div>
    )
  }

  const shown = angle === null ? '--' : Math.round(angle)
  const note = calibration.busy
    ? t('measure.calibrating')
    : calibration.failure
      ? t(calibration.failure)
      : max === null
        ? t('measure.current')
        : t('measure.max', { n: Math.round(max) })

  const recalibrate = () => {
    void calibration.run().then((saved) => {
      if (saved) setMax(null)
    })
  }

  return (
    <div className={styles.range} data-part="measure" data-mode="range">
      <FeatherFan />
      <GoniometerRing angle={angle ?? 0} target={max ?? 0} />
      <div className={styles.readout}>
        <div className={styles.title}>{t('measure.title')}</div>
        <div className={styles.angle} data-part="angle">
          {shown}°
        </div>
        <div className={styles.note} role="status" data-part="measure-note">
          {note}
        </div>
      </div>
      <div className={styles.actions}>
        <IconButton icon="back" label={t('nav.back')} onPress={nav.back} />
        <IconButton
          icon="reset"
          label={t('measure.reset')}
          disabled={calibration.busy}
          onPress={() => setMax(angle)}
        />
        <IconButton
          icon="calibrate"
          label={t('measure.recalibrate')}
          disabled={calibration.busy}
          onPress={recalibrate}
        />
      </div>
    </div>
  )
}
