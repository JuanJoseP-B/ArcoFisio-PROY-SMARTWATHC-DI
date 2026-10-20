import { useI18n } from '../../app/useI18n'
import type { SessionStats } from '../../domain/sessionRun'
import { PillButton } from '../../ui/PillButton'
import styles from './Player.module.css'

interface DoneViewProps {
  outcome: 'completed' | 'stopped'
  totals: SessionStats
  onExit(): void
}

/** The end of a workout: how it ended, what was counted, and the way out. */
export function DoneView({ outcome, totals, onExit }: DoneViewProps) {
  const { t } = useI18n()

  return (
    <div className={styles.done} data-part="done-view" data-outcome={outcome}>
      <h1 className={styles.doneTitle}>
        {outcome === 'completed' ? t('done.completed') : t('done.stopped')}
      </h1>
      <div className={styles.doneLine} data-part="done-reps">
        {t('done.reps', { n: totals.reps.length })}
      </div>
      <div className={styles.doneLine} data-part="done-max">
        {t('done.max', { n: Math.round(totals.maxAngle) })}
      </div>
      <div className={styles.doneAction}>
        <PillButton label={t('done.exit')} onPress={onExit} />
      </div>
    </div>
  )
}
