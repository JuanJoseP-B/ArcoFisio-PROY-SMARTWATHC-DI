import { useI18n } from '../../app/useI18n'
import { useMinuteClock } from '../../app/useMinuteClock'
import { BeadBands } from '../../ui/BeadBands'
import { useNav } from '../navigation/useNav'
import styles from './Face.module.css'
import { formatDate, formatTime } from './format'

interface FaceProps {
  /** Clock source; tests give a fixed time. */
  now?: () => Date
}

/** Watch face: the time in big digits. A tap anywhere opens the launcher. */
export function Face({ now }: FaceProps) {
  const { lang, t } = useI18n()
  const nav = useNav()
  const date = useMinuteClock(now)
  const time = formatTime(date, lang)
  const day = formatDate(date, lang)

  return (
    <>
      <BeadBands />
      <button
        type="button"
        className={styles.face}
        aria-label={`${time}, ${day}. ${t('face.open')}`}
        data-part="face"
        onClick={() => nav.push({ id: 'launcher' })}
      >
        <span className={styles.time} data-part="time">
          {time}
        </span>
        <span className={styles.date} data-part="date">
          {day}
        </span>
      </button>
    </>
  )
}
