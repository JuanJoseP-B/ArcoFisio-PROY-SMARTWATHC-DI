import { useI18n } from '../../app/useI18n'
import { StepRing } from '../../ui/StepRing'
import { Controls } from './Controls'
import type { Control } from './Controls'
import { pillWidth } from './format'
import styles from './Player.module.css'

interface ProgressViewProps {
  /** Repetitions done in the current set. */
  done: number
  total: number
  /** 1-based current set. */
  set: number
  sets: number
  controls: readonly Control[]
}

/** Sheet 06: the repetitions of the set on a ring, with the sets as pills underneath. */
export function ProgressView({ done, total, set, sets, controls }: ProgressViewProps) {
  const { t } = useI18n()
  const width = pillWidth(sets)

  return (
    <div className={styles.progress} data-part="progress-view">
      <StepRing done={done} total={total} />
      <div className={styles.count}>
        <div className={styles.countLabel}>{t('session.reps')}</div>
        <div className={styles.countValue} data-part="progress-count">
          {done}
          <span className={styles.countTotal}>/{total}</span>
        </div>
        <div className={styles.pills} aria-hidden="true" data-part="set-pills">
          {Array.from({ length: sets }, (_, index) => {
            const state = index + 1 < set ? 'done' : index + 1 === set ? 'active' : 'todo'
            return (
              <span
                key={index}
                className={styles.pill}
                data-state={state}
                style={{ width: state === 'active' ? width + 16 : width }}
              />
            )
          })}
        </div>
        <div className={styles.setLabel} data-part="set-label">
          {t('player.set', { n: set, total: sets })}
        </div>
      </div>
      <Controls controls={controls} />
    </div>
  )
}
