import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import type { Exercise } from '../../data/types'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { routineForExercise } from '../navigation/targets'
import { useNav } from '../navigation/useNav'
import styles from './ModeSelect.module.css'

/** Choose the exercise, then go straight to a live session with its first routine. */
export function ModeSelect() {
  const { t } = useI18n()
  const nav = useNav()

  const start = (exercise: Exercise) => {
    const routine = routineForExercise(getDataLayer().routines.list(), exercise)
    if (routine) nav.push({ id: 'session', routineId: routine.id })
  }

  return (
    <div className={styles.mode} data-part="mode-select">
      <BackButton label={t('nav.back')} onBack={nav.back} />
      <h1 className={styles.title}>{t('mode.title')}</h1>
      <PillButton label={t('mode.abduction')} onPress={() => start('abduction')} />
      <PillButton label={t('mode.flexion')} onPress={() => start('flexion')} />
    </div>
  )
}
