import { useMemo } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { signedDegrees, summarize } from '../../domain/stats'
import type { Trend } from '../../domain/stats'
import type { Zone } from '../../domain/zones'
import { ArrowHit } from '../../ui/ArrowHit'
import { IconButton } from '../../ui/IconButton'
import { ZoneChip } from '../../ui/ZoneChip'
import { useNav } from '../navigation/useNav'
import styles from './Summary.module.css'

/** Pixels the target rises in sheet 11, to leave room under the figure for the repetitions. */
const ART_LIFT = 14

/** The chip takes the look of the zone that reads the same way: a gain, a setback, neutral. */
const TREND_ZONE: Record<Trend, Zone> = { up: 'target', down: 'approach', same: 'far' }

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * Sheet 11: the best reach of the latest session, large under the arrow that hits the target,
 * and how it moved against the session before, with its sign. The repetitions held sit under
 * it, and a button opens the history.
 */
export function Summary() {
  const { t } = useI18n()
  const nav = useNav()

  const { summary, today } = useMemo(() => {
    const sessions = getDataLayer().sessions.recent(2)
    const latest = sessions[0]
    return {
      summary: summarize(sessions),
      today: latest ? sameDay(new Date(latest.startedAt), new Date()) : false,
    }
  }, [])

  const actions = (
    <div className={styles.actions}>
      <IconButton icon="back" label={t('nav.back')} onPress={nav.back} />
      {summary ? (
        <IconButton
          icon="history"
          label={t('summary.history')}
          onPress={() => nav.push({ id: 'history' })}
        />
      ) : null}
    </div>
  )

  if (!summary) {
    return (
      <div className={styles.summary} data-part="summary" data-state="empty">
        <ArrowHit hit={false} lift={ART_LIFT} />
        <div className={styles.stack}>
          <h1 className={styles.title}>{t('launcher.summary')}</h1>
          <p className={styles.empty} data-part="summary-empty">
            {t('summary.empty')}
          </p>
        </div>
        {actions}
      </div>
    )
  }

  const { change } = summary

  return (
    <div className={styles.summary} data-part="summary" data-state="session">
      <ArrowHit lift={ART_LIFT} />
      <div className={styles.stack}>
        <div className={styles.up} data-part="summary-label">
          {t(today ? 'summary.maxToday' : 'summary.maxLast')}
        </div>
        <div className={`${styles.up} ${styles.max}`} data-part="summary-max">
          {summary.max}°
        </div>
        <div className={`${styles.up} ${styles.second}`}>
          <ZoneChip
            zone={change ? TREND_ZONE[change.trend] : 'far'}
            label={
              change
                ? t('summary.vsPrevious', { delta: signedDegrees(change.delta) })
                : t('summary.first')
            }
            icon={false}
          />
        </div>
        <div className={`${styles.up} ${styles.second} ${styles.held}`} data-part="summary-held">
          {t('summary.held', { held: summary.held, total: summary.reps })}
        </div>
      </div>
      {actions}
    </div>
  )
}
