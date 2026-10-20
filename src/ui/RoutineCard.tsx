import styles from './RoutineCard.module.css'

interface RoutineCardProps {
  /** Already translated: the routine's name, or the label of an action card. */
  title: string
  /** Already formatted second line, e.g. "3×10 · 150°". */
  subtitle?: string
  /** Share of the thumbnail ring that is filled, 0 to 1; a plus sign is drawn instead when absent. */
  fill?: number
  /** Position in the list: each card enters 120 ms after the one before it, up to the third. */
  index?: number
  onPress(): void
}

const RING_LENGTH = 63
const STAGGER_MS = 120
const STAGGER_CARDS = 3

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

/**
 * Sheet 10: a 264 x 64 card with a thumbnail, a name and a line of details. It enters with a
 * hit of the arrow and its ring fills. A card without `fill` is an action and shows a plus.
 */
export function RoutineCard({ title, subtitle, fill, index = 0, onPress }: RoutineCardProps) {
  const delay = Math.min(index, STAGGER_CARDS - 1) * STAGGER_MS
  const offset = fill === undefined ? RING_LENGTH : RING_LENGTH * (1 - clamp01(fill))

  return (
    <button
      type="button"
      className={styles.card}
      style={{ animationDelay: `${delay}ms` }}
      data-part="routine-card"
      onClick={onPress}
    >
      <span className={styles.thumb} aria-hidden="true">
        {fill === undefined ? (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path className={styles.plus} d="M16 9 L16 23 M9 16 L23 16" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle className={styles.track} cx="16" cy="16" r="10" />
            <circle
              className={styles.fill}
              style={
                { '--o': offset.toFixed(1), animationDelay: `${delay}ms` } as React.CSSProperties
              }
              cx="16"
              cy="16"
              r="10"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={offset.toFixed(1)}
              transform="rotate(-90 16 16)"
              data-part="card-fill"
            />
          </svg>
        )}
      </span>
      <span className={styles.text}>
        <span className={styles.title} data-part="card-title">
          {title}
        </span>
        {subtitle ? (
          <span className={styles.subtitle} data-part="card-subtitle">
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  )
}
