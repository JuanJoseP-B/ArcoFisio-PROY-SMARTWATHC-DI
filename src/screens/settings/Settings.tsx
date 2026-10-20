import { useState } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { defaultSettings } from '../../data/settingsRepo'
import type { Lang } from '../../data/types'
import { LIMITS } from '../../data/validators'
import { getFeedback } from '../../feedback'
import { forgetCalibration, getSensorKit } from '../../sensors/kit'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { Stepper } from '../../ui/Stepper'
import { ToggleRow } from '../../ui/ToggleRow'
import { useNav } from '../navigation/useNav'
import styles from './Settings.module.css'

const LANGUAGES: readonly Lang[] = ['es', 'en']
const TOLERANCE_STEP_DEG = 0.5

/**
 * Settings: the language (it switches at once, no reload), sound and vibration, how far from
 * the target still counts as on it, and erasing everything saved. Every change is saved as it
 * is made. Erasing asks a second time, then starts over from the intro as on a first run.
 */
export function Settings() {
  const { t, lang, setLang } = useI18n()
  const nav = useNav()
  const data = getDataLayer()
  const [settings, setSettings] = useState(() => data.settings.get())
  const [confirming, setConfirming] = useState(false)

  const change = (patch: Partial<typeof settings>) => {
    const next = data.settings.update(patch)
    setSettings(next)
    getFeedback().applySettings(next)
  }

  const erase = () => {
    data.clearAll()
    forgetCalibration(getSensorKit())
    const fresh = defaultSettings()
    getFeedback().applySettings(fresh)
    setLang(fresh.lang)
    nav.reset({ id: 'intro' })
  }

  const number = (n: number) => n.toLocaleString(lang)
  const state = (on: boolean) => t(on ? 'settings.on' : 'settings.off')
  const tolerance = t('settings.tolerance')

  return (
    <div className={styles.settings} data-part="settings">
      <div className={styles.list} data-part="settings-list">
        <h1 className={styles.title}>{t('launcher.settings')}</h1>
        <Stepper
          label={t('setup.language')}
          valueText={t(`lang.${lang}`)}
          value={LANGUAGES.indexOf(lang)}
          min={0}
          max={LANGUAGES.length - 1}
          decreaseLabel={t('builder.previous')}
          increaseLabel={t('player.next')}
          onChange={(index) => setLang(LANGUAGES[index] ?? lang)}
        />
        <ToggleRow
          label={t('settings.sound')}
          stateText={state(settings.sound)}
          checked={settings.sound}
          onChange={(sound) => change({ sound })}
        />
        <ToggleRow
          label={t('settings.vibration')}
          stateText={state(settings.vibration)}
          checked={settings.vibration}
          onChange={(vibration) => change({ vibration })}
        />
        <Stepper
          label={tolerance}
          valueText={t('settings.toleranceValue', { n: number(settings.tolerance) })}
          value={settings.tolerance}
          min={LIMITS.tolerance.min}
          max={LIMITS.tolerance.max}
          step={TOLERANCE_STEP_DEG}
          decreaseLabel={t('config.decrease', { name: tolerance })}
          increaseLabel={t('config.increase', { name: tolerance })}
          onChange={(value) => change({ tolerance: value })}
        />
        {data.storage.isFallback() ? (
          <p className={styles.notice} role="status" data-part="memory-notice">
            {t('settings.memoryOnly')}
          </p>
        ) : null}
        <div className={styles.actions}>
          {confirming ? (
            <div className={styles.confirm} role="alertdialog" data-part="erase-confirm">
              <div className={styles.question}>{t('settings.confirmErase')}</div>
              <PillButton label={t('settings.confirmYes')} variant="secondary" onPress={erase} />
              <PillButton
                label={t('builder.cancel')}
                variant="secondary"
                onPress={() => setConfirming(false)}
              />
            </div>
          ) : (
            <PillButton
              label={t('settings.erase')}
              variant="secondary"
              onPress={() => setConfirming(true)}
            />
          )}
        </div>
      </div>
      {/* After the list, so it stays on top of it and keeps taking presses. */}
      <BackButton label={t('nav.back')} onBack={nav.back} />
    </div>
  )
}
