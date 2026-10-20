import { useMemo } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { historyRows, signedDegrees } from '../../domain/stats'
import type { Trend } from '../../domain/stats'
import { BackButton } from '../../ui/BackButton'
import { useNav } from '../navigation/useNav'
import styles from './History.module.css'

/** Rows shown. One session more is read, so the oldest row still has one to compare with. */
export const HISTORY_ROWS = 20

const TREND_CLASS: Record<Trend, string> = {
  up: styles.up!,
  down: styles.down!,
  same: styles.same!,
}

/**
 * The last sessions, newest first, as a scrolling list: the best reach of each, the routine,
 * when it was, and how the reach moved against the session before it, with its sign.
 */
export function History() {
  const { t, lang } = useI18n()
  const nav = useNav()

  const rows = useMemo(() => {
    const data = getDataLayer()
    return historyRows(data.sessions.recent(HISTORY_ROWS + 1), HISTORY_ROWS).map(
      ({ session, change }) => ({
        session,
        change,
        routine: data.routines.get(session.routineId),
      }),
    )
  }, [])

  const when = useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lang],
  )

  return (
    <div className={styles.history} data-part="history">
      <div className={styles.list} data-part="history-list">
        <h1 className={styles.title}>{t('history.title')}</h1>
        {rows.length === 0 ? (
          <p className={styles.empty} data-part="history-empty">
            {t('summary.empty')}
          </p>
        ) : (
          rows.map(({ session, change, routine }) => (
            <div key={session.id} className={styles.row} data-part="history-row">
              <div className={styles.reach}>
                <span className={styles.max} data-part="history-max">
                  {Math.round(session.maxAngle)}°
                </span>
                {change ? (
                  <span
                    className={`${styles.change} ${TREND_CLASS[change.trend]}`}
                    data-part="history-change"
                    data-trend={change.trend}
                  >
                    {signedDegrees(change.delta)}
                  </span>
                ) : null}
              </div>
              <div className={styles.text}>
                <span className={styles.name} data-part="history-routine">
                  {routine ? routine.name[lang] : t('history.removed')}
                </span>
                <span className={styles.date} data-part="history-date">
                  {when.format(new Date(session.startedAt))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      {/* After the list, so it stays on top of it and keeps taking presses. */}
      <BackButton label={t('nav.back')} onBack={nav.back} />
    </div>
  )
}
