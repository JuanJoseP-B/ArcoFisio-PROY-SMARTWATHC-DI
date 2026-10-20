import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../app/useI18n'
import type { AngleActions } from '../../app/useAngle'
import type { MessageKey } from '../../i18n/translate'
import type { TrackerStatus } from '../../sensors/tracker'
import { PillButton } from '../../ui/PillButton'
import { failureMessage, messageFor, stepFor, suggestsSimulator } from './measureFlow'
import styles from './SensorSteps.module.css'

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
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<MessageKey | null>(null)
  const alive = useRef(true)
  const step = stepFor(status)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const calibrate = async () => {
    setBusy(true)
    setFailure(null)
    const result = await actions.calibrate()
    if (!alive.current) return
    setBusy(false)
    if (!result.ok) setFailure(failureMessage(result.reason))
  }

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
        <PillButton label={t('sensor.calibrate')} onPress={() => void calibrate()} />
      ) : null}
      {onSkip ? <PillButton variant="secondary" label={t('setup.skip')} onPress={onSkip} /> : null}
    </div>
  )
}
