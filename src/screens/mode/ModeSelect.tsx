import { useI18n } from '../../app/useI18n'
import type { Exercise } from '../../data/types'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { useNav } from '../navigation/useNav'
import styles from './ModeSelect.module.css'

/** Choose the exercise, then set it up (target, repetitions, sets) before the session. */
export function ModeSelect() {
  const { t } = useI18n()
  const nav = useNav()

  const start = (exercise: Exercise) => nav.push({ id: 'config', exercise })

  return (
    <div className={styles.mode} data-part="mode-select">
      <BackButton label={t('nav.back')} onBack={nav.back} />
      <h1 className={styles.title}>{t('mode.title')}</h1>
      <PillButton label={t('mode.abduction')} onPress={() => start('abduction')} />
      <PillButton label={t('mode.flexion')} onPress={() => start('flexion')} />
    </div>
  )
}
