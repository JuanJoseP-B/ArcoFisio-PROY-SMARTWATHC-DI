import { geometry } from '../design/tokens'
import styles from './RestTimer.module.css'
import { grassBlades, restGeometry } from './restGeometry'

interface RestTimerProps {
  /** Share of the rest already gone, 0 to 1. */
  progress: number
  /** The rest is over: the ring turns green and the arrow is let go. */
  done: boolean
  /** Already translated: "Descanso", or "Siguiente serie" when it is over. */
  label: string
  /** Already formatted: "0:30", or "¡Listo!" when it is over. */
  time: string
}

const SIZE = geometry.screenSize
const CENTER = SIZE / 2
const BOW_LEFT = 132
const BOW_RIGHT = 252
const BOW_TIPS_Y = 140

/**
 * Sheet 07: a bow whose string is drawn back as the rest runs out, inside a ring that empties.
 * When time is up the ring turns green, the string snaps and the arrow flies out.
 */
export function RestTimer({ progress, done, label, time }: RestTimerProps) {
  const rest = restGeometry(done ? 1 : progress)
  const blades = grassBlades()

  return (
    <div className={styles.timer} data-part="rest-timer" data-done={done}>
      <svg
        className={styles.layer}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <g className={styles.scene}>
          <circle className={styles.sun} cx="270" cy="250" r="54" />
          <path
            className={styles.hillFar}
            d="M0 300 Q70 240 140 290 Q210 230 290 285 Q340 260 384 280 L384 384 L0 384 Z"
          />
          <path
            className={styles.hillNear}
            d="M0 330 Q90 290 190 325 Q290 300 384 320 L384 384 L0 384 Z"
          />
          {blades.map((blade) => (
            <path key={blade.d} className={styles.blade} d={blade.d} />
          ))}
        </g>
      </svg>
      <svg
        className={styles.layer}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle className={styles.halo} cx={CENTER} cy={CENTER} r={geometry.ringRadius} />
        <circle className={styles.track} cx={CENTER} cy={CENTER} r={geometry.ringRadius} />
        <circle
          className={styles.arc}
          cx={CENTER}
          cy={CENTER}
          r={geometry.ringRadius}
          strokeDasharray={geometry.ringCircumference}
          strokeDashoffset={rest.dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          data-part="rest-arc"
        />
        <path
          className={styles.bow}
          d={`M ${BOW_LEFT} ${BOW_TIPS_Y} Q ${CENTER} 70 ${BOW_RIGHT} ${BOW_TIPS_Y}`}
        />
        <path
          className={`${styles.string} ${done ? styles.snap : ''}`}
          d={`M ${BOW_LEFT} ${BOW_TIPS_Y} L ${CENTER} ${rest.pullY} L ${BOW_RIGHT} ${BOW_TIPS_Y}`}
        />
        <g className={done ? styles.flying : undefined} data-part="rest-arrow">
          <line className={styles.shaft} x1={CENTER} y1={rest.tailY} x2={CENTER} y2={rest.nockY} />
          <path className={styles.head} d={`M ${CENTER} ${rest.tipY} l -7 12 l 7 -3 l 7 3 Z`} />
        </g>
      </svg>
      <div className={styles.text}>
        <div className={styles.label} data-part="rest-label">
          {label}
        </div>
        <div className={styles.time} data-part="rest-time">
          {time}
        </div>
      </div>
    </div>
  )
}
