import { color } from '../../design/tokens'
import styles from './Wordmark.module.css'

interface WordmarkProps {
  tagline: string
  opacity: number
  /** Vertical offset in px; the lockup rises into place as it appears. */
  shift: number
}

/** ARCO, arrow, FISIO and tagline. The text is real DOM so it stays selectable by readers. */
export function Wordmark({ tagline, opacity, shift }: WordmarkProps) {
  return (
    <div
      className={styles.wordmark}
      data-part="wordmark"
      style={{ opacity: opacity.toFixed(2), transform: `translateY(${shift.toFixed(1)}px)` }}
    >
      <div className={styles.arco}>ARCO</div>
      <svg width="130" height="14" viewBox="0 0 130 14" aria-hidden="true">
        <line x1="12" y1="7" x2="118" y2="7" stroke={color.gold} strokeWidth="2" />
        <path d="M126 7 L114 1 L117 7 L114 13 Z" fill={color.gold} />
        <path
          d="M12 7 L4 1 M12 7 L4 13 M19 7 L11 1 M19 7 L11 13"
          stroke={color.terracotta}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.fisio}>FISIO</div>
      <div className={styles.tagline}>{tagline}</div>
    </div>
  )
}
