import { AMBIENT_WATER, DIAL_SIZE, WAVE_LAYER_GAP } from './dialGeometry'
import styles from './Water.module.css'

interface WaterProps {
  /** Height of the surface in the 384 watch space (smaller is higher). */
  level?: number
  /** Extra class for the svg, e.g. an entrance animation. */
  className?: string
}

/** One wave period is 192 px wide, so a 192 px drift loops without a seam. */
const WAVE_UP = 'q48-12 96 0t96 0t96 0t96 0t96 0t96 0t96 0t96 0'
const WAVE_DOWN = 'q48 12 96 0t96 0t96 0t96 0t96 0t96 0t96 0t96 0'
const BACK_WAVE = `M-192 0${WAVE_UP}V900H-192Z`
const FRONT_WAVE = `M-192 ${WAVE_LAYER_GAP}${WAVE_DOWN}V900H-192Z`

/**
 * The water of the Marea screens (handoff 03): two translucent wave layers drifting in
 * opposite directions (8 s the front, 13 s the back), the front one 8 px lower. A change of
 * `level` slides the water to its new height in 600 ms; with reduced motion it jumps and the
 * waves stand still.
 */
export function Water({ level = AMBIENT_WATER.start, className }: WaterProps) {
  const classes = [styles.water, className ?? ''].filter(Boolean)
  return (
    <svg
      className={classes.join(' ')}
      viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
      aria-hidden="true"
      data-part="water"
      data-level={level}
    >
      <g className={styles.surface} style={{ transform: `translateY(${level}px)` }}>
        <g className={`${styles.layer} ${styles.back}`}>
          <path className={styles.fillBack} d={BACK_WAVE} />
        </g>
        <g className={`${styles.layer} ${styles.front}`}>
          <path className={styles.fillFront} d={FRONT_WAVE} />
        </g>
      </g>
    </svg>
  )
}
