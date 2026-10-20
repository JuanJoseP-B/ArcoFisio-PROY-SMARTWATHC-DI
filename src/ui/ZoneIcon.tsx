import type { Zone } from '../domain/zones'
import styles from './ZoneIcon.module.css'
import { zoneGesture } from './zoneGesture'

const BOW = 'M7 3 Q19 12 7 21'
const ARROW_HEAD = 'M17 9 L21 12 L17 15'

interface ZoneIconProps {
  zone: Zone
  size?: number
}

/** Currentcolor bow icon; the arrow flies, the string buzzes, the bow shakes or breathes. */
export function ZoneIcon({ zone, size = 18 }: ZoneIconProps) {
  const gesture = zoneGesture(zone)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      data-part="zone-icon"
      data-gesture={gesture}
    >
      {gesture === 'rest' ? (
        <g className={`${styles.fb} ${styles.breathe}`}>
          <path d="M5 8 Q12 20 19 8" />
          <line x1="5" y1="8" x2="19" y2="8" strokeWidth="1" />
        </g>
      ) : null}

      {gesture === 'pain' ? (
        <>
          <g className={`${styles.fb} ${styles.shake}`}>
            <path d={BOW} />
            <line x1="7" y1="3" x2="7" y2="21" strokeWidth="1" />
          </g>
          <g className={styles.droop}>
            <line x1="5" y1="12" x2="18" y2="12" />
            <path d="M15 9 L18 12 L15 15" />
          </g>
        </>
      ) : null}

      {gesture === 'buzz' ? (
        <>
          <path d={BOW} />
          <g className={styles.buzz}>
            <path d="M7 3 L3 12 L7 21" strokeWidth="1" />
            <line x1="3" y1="12" x2="20" y2="12" />
            <path d={ARROW_HEAD} />
          </g>
        </>
      ) : null}

      {gesture === 'fly' || gesture === 'still' ? (
        <>
          <path d={BOW} />
          <line x1="7" y1="3" x2="7" y2="21" strokeWidth="1" />
          <g className={gesture === 'fly' ? styles.fly : undefined}>
            <line x1="3" y1="12" x2="20" y2="12" />
            <path d={ARROW_HEAD} />
          </g>
        </>
      ) : null}
    </svg>
  )
}
