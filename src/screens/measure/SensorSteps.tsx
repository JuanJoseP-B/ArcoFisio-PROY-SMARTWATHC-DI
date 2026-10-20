import { useI18n } from '../../app/useI18n'
import type { AngleActions } from '../../app/useAngle'
import type { TrackerStatus } from '../../sensors/tracker'
import { PillButton } from '../../ui/PillButton'
import { messageFor, stepFor, suggestsSimulator } from './measureFlow'
import styles from './SensorSteps.module.css'
import { useCalibrate } from './useCalibrate'

interface SensorStepsProps {
  status: TrackerStatus
  actions: AngleActions
  /** When given, a "Skip" button lets the person go on without a working sensor. */
  onSkip?: () => void
}

/**
 * What the person has to do to get a live angle: allow the sensor (a tap, because iOS only
 * asks inside one), then hang the arm still while the reference is read. Says plainly why a
 * step failed. The pill that asks for access acts at once, so the tap still counts as a gesture.
 */
export function SensorSteps({ status, actions, onSkip }: SensorStepsProps) {
  const { t } = useI18n()
  const calibration = useCalibrate(actions)
  const step = stepFor(status)

  const { busy, failure } = calibration
  const message = busy ? 'measure.calibrating' : (failure ?? messageFor(status))

  return (
    <div className={styles.steps} data-part="sensor-steps" data-step={step}>
      <div className={styles.message} role="status" data-part="sensor-message">
        {t(message)}
      </div>
      {suggestsSimulator(status) ? <div className={styles.hint}>{t('sensor.simHint')}</div> : null}
      {step === 'enable' ? (
        <PillButton
          variant="secondary"
          label={t('sensor.enable')}
          onPress={() => void actions.requestPermission()}
        />
      ) : null}
      {step === 'calibrate' && !busy ? (
        <PillButton label={t('sensor.calibrate')} onPress={() => void calibration.run()} />
      ) : null}
      {onSkip ? <PillButton variant="secondary" label={t('setup.skip')} onPress={onSkip} /> : null}
    </div>
  )
}
