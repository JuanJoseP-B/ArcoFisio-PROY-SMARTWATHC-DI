import { useMemo } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { ANGLE_MAX_DEG } from '../../domain/constants'
import { BackButton } from '../../ui/BackButton'
import { RoutineCard } from '../../ui/RoutineCard'
import { useNav } from '../navigation/useNav'
import styles from './Library.module.css'

/**
 * Sheet 10: the routines as a scrolling list of cards, the ready-made ones first and then the
 * person's own. The first card makes a new one; the others open their detail.
 */
export function Library() {
  const { t, lang } = useI18n()
  const nav = useNav()
  const routines = useMemo(() => getDataLayer().routines.list(), [])

  return (
    <div className={styles.library} data-part="library">
      <div className={styles.list} data-part="library-list">
        <h1 className={styles.title}>{t('launcher.routines')}</h1>
        <RoutineCard
          title={t('library.new')}
          index={0}
          onPress={() => nav.push({ id: 'builder' })}
        />
        {routines.map((routine, index) => (
          <RoutineCard
            key={routine.id}
            title={routine.name[lang]}
            subtitle={t('routine.summary', {
              sets: routine.sets,
              reps: routine.reps,
              target: routine.targetAngle,
            })}
            fill={routine.targetAngle / ANGLE_MAX_DEG}
            index={index + 1}
            onPress={() => nav.push({ id: 'routine', routineId: routine.id })}
          />
        ))}
      </div>
      {/* After the list, so it stays on top of it and keeps taking presses. */}
      <BackButton label={t('nav.back')} onBack={nav.back} />
    </div>
  )
}
