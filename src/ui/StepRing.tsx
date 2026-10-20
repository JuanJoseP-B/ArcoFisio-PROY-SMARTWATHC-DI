import { geometry } from '../design/tokens'
import styles from './StepRing.module.css'
import { aimAngle, stepSegments } from './stepGeometry'

interface StepRingProps {
  /** Steps finished so far. */
  done: number
  total: number
}

const SIZE = geometry.screenSize
const CENTER = SIZE / 2

/**
 * Sheet 06: the ring split into one segment per step. When a step closes, an arrow flies out
 * from the middle and lands on its segment. The counter in the middle belongs to the screen.
 */
export function StepRing({ done, total }: StepRingProps) {
  const segments = stepSegments(done, total)

  return (
    <svg
      className={styles.ring}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-part="step-ring"
      data-done={done}
      data-total={total}
    >
      {segments.map((segment, index) => (
        <circle
          key={index}
          className={styles.segment}
          data-state={segment.state}
          cx={CENTER}
          cy={CENTER}
          r={geometry.ringRadius}
          strokeDasharray={`${segment.dash} ${geometry.ringCircumference}`}
          strokeDashoffset={segment.offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      ))}
      {done > 0 ? (
        <g
          key={done}
          className={styles.arrow}
          style={{ '--aim': `${aimAngle(done, total)}deg` } as React.CSSProperties}
          data-part="step-arrow"
        >
          <line x1="192" y1="76" x2="192" y2="52" className={styles.shaft} />
          <path d="M 192 46 l -6 10 l 6 -3 l 6 3 Z" className={styles.head} />
          <path d="M 186 80 l 6 -6 l 6 6" className={styles.fletching} />
        </g>
      ) : null}
    </svg>
  )
}
