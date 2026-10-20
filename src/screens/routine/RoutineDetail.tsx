import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { isInPainArc } from '../../domain/zones'
import { BackButton } from '../../ui/BackButton'
import { PillButton } from '../../ui/PillButton'
import { useNav } from '../navigation/useNav'
import styles from './RoutineDetail.module.css'

interface RoutineDetailProps {
  routineId: string | undefined
}

/**
 * What a routine asks for, with a way to start it. The person's own routines can also be edited.
 * When the target falls inside the saved painful arc, a warning takes the place of the details.
 */
export function RoutineDetail({ routineId }: RoutineDetailProps) {
  const { t, lang } = useI18n()
  const nav = useNav()
  const data = getDataLayer()
  const routine = routineId ? data.routines.get(routineId) : null

  const back = <BackButton label={t('nav.back')} onBack={nav.back} />

  if (!routine) {
    return (
      <div className={styles.detail} data-part="routine-detail" data-missing="true">
        {back}
        <div className={styles.missing}>{t('routine.missing')}</div>
      </div>
    )
  }

  const painful = isInPainArc(routine.targetAngle, data.painArc.get())
  const facts = [
    { key: 'sets', label: t('config.sets'), value: String(routine.sets) },
    { key: 'reps', label: t('config.reps'), value: String(routine.reps) },
    { key: 'rest', label: t('config.rest'), value: t('config.seconds', { n: routine.restSec }) },
  ]

  return (
    <div className={styles.detail} data-part="routine-detail" data-routine={routine.id}>
      {back}
      <h1 className={styles.name} data-part="detail-name">
        {routine.name[lang]}
      </h1>
      {painful ? (
        <div
          className={`${styles.line} ${styles.warning}`}
          role="status"
          data-part="detail-warning"
        >
          {t('routine.painWarning')}
        </div>
      ) : (
        <div className={styles.line} data-part="detail-target">
          {t(`mode.${routine.exercise}`)} · {routine.targetAngle}°
        </div>
      )}
      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.key} className={styles.fact} data-fact={fact.key}>
            <dt className={styles.factLabel}>{fact.label}</dt>
            <dd className={styles.factValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.actions}>
        <PillButton
          label={t('config.start')}
          onPress={() => nav.push({ id: 'session', routineId: routine.id })}
        />
        {routine.builtin ? null : (
          <PillButton
            label={t('routine.edit')}
            variant="secondary"
            onPress={() => nav.push({ id: 'builder', routineId: routine.id })}
          />
        )}
      </div>
    </div>
  )
}
