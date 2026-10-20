import { useState } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { loadConfig, quickRoutineId, saveConfig } from '../../data/quickConfig'
import type { RoutineConfig } from '../../data/quickConfig'
import type { Exercise } from '../../data/types'
import { LIMITS } from '../../data/validators'
import { PillButton } from '../../ui/PillButton'
import { Stepper } from '../../ui/Stepper'
import { useNav } from '../navigation/useNav'
import styles from './Counts.module.css'

interface CountsProps {
  exercise: Exercise
}

const REST_STEP_SEC = 5

/**
 * Second half of Configuration: repetitions, sets and rest between sets, then start. Changes
 * are saved as they are made; Start opens a session with the exercise's custom routine.
 */
export function Counts({ exercise }: CountsProps) {
  const { t } = useI18n()
  const nav = useNav()
  const [config, setConfig] = useState(() => loadConfig(getDataLayer(), exercise))

  const change = (patch: Partial<RoutineConfig>) => {
    const next = { ...config, ...patch }
    setConfig(next)
    saveConfig(getDataLayer(), exercise, next)
  }

  const start = () => {
    saveConfig(getDataLayer(), exercise, config)
    nav.push({ id: 'session', routineId: quickRoutineId(exercise) })
  }

  const name = {
    reps: t('config.reps'),
    sets: t('config.sets'),
    rest: t('config.rest'),
  }

  return (
    <div className={styles.counts} data-part="counts" data-exercise={exercise}>
      <Stepper
        label={name.reps}
        valueText={String(config.reps)}
        value={config.reps}
        min={LIMITS.reps.min}
        max={LIMITS.reps.max}
        decreaseLabel={t('config.decrease', { name: name.reps })}
        increaseLabel={t('config.increase', { name: name.reps })}
        onChange={(reps) => change({ reps })}
      />
      <Stepper
        label={name.sets}
        valueText={String(config.sets)}
        value={config.sets}
        min={LIMITS.sets.min}
        max={LIMITS.sets.max}
        decreaseLabel={t('config.decrease', { name: name.sets })}
        increaseLabel={t('config.increase', { name: name.sets })}
        onChange={(sets) => change({ sets })}
      />
      <Stepper
        label={name.rest}
        valueText={t('config.seconds', { n: config.restSec })}
        value={config.restSec}
        min={LIMITS.restSec.min}
        max={LIMITS.restSec.max}
        step={REST_STEP_SEC}
        decreaseLabel={t('config.decrease', { name: name.rest })}
        increaseLabel={t('config.increase', { name: name.rest })}
        onChange={(restSec) => change({ restSec })}
      />
      <div className={styles.start}>
        <PillButton label={t('config.start')} onPress={start} />
      </div>
    </div>
  )
}
