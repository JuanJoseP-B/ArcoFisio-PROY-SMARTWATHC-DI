import { useAngle } from '../../app/useAngle'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import type { SensorKit } from '../../sensors/kit'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { SensorSteps } from '../measure/SensorSteps'
import { stepFor } from '../measure/measureFlow'
import { useNav } from '../navigation/useNav'
import styles from './Setup.module.css'

interface SensorSetupProps {
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
}

/**
 * Second step of the first run: allow the sensor and read the arm-down reference, or skip.
 * Finishing, by either way, marks the first run done and opens the launcher over the face.
 */
export function SensorSetup({ kit }: SensorSetupProps) {
  const { t } = useI18n()
  const nav = useNav()
  const { status, actions } = useAngle(kit ? { kit } : {})

  const finish = () => {
    getDataLayer().settings.update({ firstRunDone: true })
    nav.reset({ id: 'face' })
    nav.push({ id: 'launcher' })
  }

  return (
    <div className={styles.setup} data-part="sensor-setup">
      <BackButton label={t('nav.back')} onBack={nav.back} />
      {stepFor(status) === 'range' ? (
        <>
          <h1 className={styles.title} data-part="setup-ready">
            {t('setup.ready')}
          </h1>
          <PillButton label={t('config.next')} onPress={finish} />
        </>
      ) : (
        <SensorSteps status={status} actions={actions} onSkip={finish} />
      )}
    </div>
  )
}
