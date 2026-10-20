import { useI18n } from '../../app/useI18n'
import { RestTimer } from '../../ui/RestTimer'
import { Controls } from './Controls'
import type { Control } from './Controls'
import { formatClock } from './format'
import styles from './Player.module.css'

interface RestViewProps {
  leftMs: number
  totalMs: number
  /** The rest ran out and the next set is about to begin. */
  over: boolean
  paused: boolean
  controls: readonly Control[]
}

/** Sheet 07 with the words the player gives it. */
export function RestView({ leftMs, totalMs, over, paused, controls }: RestViewProps) {
  const { t } = useI18n()
  const progress = totalMs > 0 ? 1 - leftMs / totalMs : 1

  return (
    <div className={styles.rest} data-part="rest-view" data-paused={paused}>
      <RestTimer
        progress={progress}
        done={over}
        label={over ? t('rest.nextSet') : paused ? t('player.paused') : t('rest.label')}
        time={over ? t('rest.ready') : formatClock(Math.ceil(leftMs / 1000))}
      />
      <Controls controls={controls} />
    </div>
  )
}
