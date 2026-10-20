import { useState } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import {
  EXERCISES,
  MIN_TARGET_DEG,
  autoName,
  draftFromRoutine,
  newDraft,
  routineFromDraft,
} from '../../data/routineDraft'
import type { RoutineDraft } from '../../data/routineDraft'
import { LIMITS } from '../../data/validators'
import { ANGLE_MAX_DEG } from '../../domain/constants'
import { WHEEL_STEP_DEG } from '../../domain/wheel'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { Stepper } from '../../ui/Stepper'
import { useNav } from '../navigation/useNav'
import styles from './Builder.module.css'

interface BuilderProps {
  /** The routine to edit; none to make a new one. Ready-made routines cannot be edited. */
  routineId: string | undefined
}

const REST_STEP_SEC = 5

/**
 * Makes or edits one of the person's own routines: a name, the exercise, the target and the
 * counts, in a scrolling list of the same steppers the quick configuration uses. An existing
 * routine can also be deleted, after a second press to confirm.
 */
export function Builder({ routineId }: BuilderProps) {
  const { t, lang } = useI18n()
  const nav = useNav()
  const data = getDataLayer()
  const [previous] = useState(() => {
    const found = routineId ? data.routines.get(routineId) : null
    return found && !found.builtin ? found : null
  })
  const [draft, setDraft] = useState<RoutineDraft>(() =>
    previous ? draftFromRoutine(previous, lang) : newDraft(data.settings.get()),
  )
  const [confirming, setConfirming] = useState(false)

  const change = (patch: Partial<RoutineDraft>) => setDraft((current) => ({ ...current, ...patch }))

  const save = () => {
    const routine = routineFromDraft(draft, {
      lang,
      tolerance: data.settings.get().tolerance,
      ...(previous ? { previous } : {}),
    })
    if (data.routines.save(routine)) nav.back()
  }

  const remove = () => {
    if (previous && data.routines.remove(previous.id)) nav.popTo('routines')
  }

  const labels = {
    exercise: t('mode.title'),
    target: t('config.target'),
    reps: t('config.reps'),
    sets: t('config.sets'),
    rest: t('config.rest'),
  }

  return (
    <div className={styles.builder} data-part="builder" data-mode={previous ? 'edit' : 'new'}>
      <div className={styles.list} data-part="builder-list">
        <h1 className={styles.title}>{t(previous ? 'builder.titleEdit' : 'builder.titleNew')}</h1>
        <input
          className={styles.input}
          type="text"
          value={draft.name}
          maxLength={LIMITS.nameLength}
          placeholder={autoName(draft.exercise, draft.target)[lang]}
          aria-label={t('builder.name')}
          autoComplete="off"
          data-part="builder-name"
          onChange={(event) => change({ name: event.target.value })}
        />
        <Stepper
          label={labels.exercise}
          valueText={t(`mode.${draft.exercise}`)}
          value={EXERCISES.indexOf(draft.exercise)}
          min={0}
          max={EXERCISES.length - 1}
          decreaseLabel={t('builder.previous')}
          increaseLabel={t('player.next')}
          onChange={(index) => change({ exercise: EXERCISES[index] ?? draft.exercise })}
        />
        <Stepper
          label={labels.target}
          valueText={`${draft.target}°`}
          value={draft.target}
          min={MIN_TARGET_DEG}
          max={ANGLE_MAX_DEG}
          step={WHEEL_STEP_DEG}
          decreaseLabel={t('config.decrease', { name: labels.target })}
          increaseLabel={t('config.increase', { name: labels.target })}
          onChange={(target) => change({ target })}
        />
        <Stepper
          label={labels.reps}
          valueText={String(draft.reps)}
          value={draft.reps}
          min={LIMITS.reps.min}
          max={LIMITS.reps.max}
          decreaseLabel={t('config.decrease', { name: labels.reps })}
          increaseLabel={t('config.increase', { name: labels.reps })}
          onChange={(reps) => change({ reps })}
        />
        <Stepper
          label={labels.sets}
          valueText={String(draft.sets)}
          value={draft.sets}
          min={LIMITS.sets.min}
          max={LIMITS.sets.max}
          decreaseLabel={t('config.decrease', { name: labels.sets })}
          increaseLabel={t('config.increase', { name: labels.sets })}
          onChange={(sets) => change({ sets })}
        />
        <Stepper
          label={labels.rest}
          valueText={t('config.seconds', { n: draft.restSec })}
          value={draft.restSec}
          min={LIMITS.restSec.min}
          max={LIMITS.restSec.max}
          step={REST_STEP_SEC}
          decreaseLabel={t('config.decrease', { name: labels.rest })}
          increaseLabel={t('config.increase', { name: labels.rest })}
          onChange={(restSec) => change({ restSec })}
        />
        <div className={styles.actions}>
          <PillButton label={t('builder.save')} onPress={save} />
          {previous && !confirming ? (
            <PillButton
              label={t('builder.delete')}
              variant="secondary"
              onPress={() => setConfirming(true)}
            />
          ) : null}
          {previous && confirming ? (
            <div className={styles.confirm} role="alertdialog" data-part="delete-confirm">
              <div className={styles.question}>{t('builder.confirmDelete')}</div>
              <PillButton label={t('builder.confirmYes')} variant="secondary" onPress={remove} />
              <PillButton
                label={t('builder.cancel')}
                variant="secondary"
                onPress={() => setConfirming(false)}
              />
            </div>
          ) : null}
        </div>
      </div>
      {/* After the list, so it stays on top of it and keeps taking presses. */}
      <BackButton label={t('nav.back')} onBack={nav.back} />
    </div>
  )
}
