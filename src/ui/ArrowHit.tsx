import { color, geometry } from '../design/tokens'
import styles from './ArrowHit.module.css'

const SIZE = geometry.screenSize
const CENTER = SIZE / 2
/** Where the target sits in sheet 11: 192 across, 122 down. */
const TARGET_Y = 122
const RAYS = Array.from({ length: 24 }, (_, i) => i * 15)

interface ArrowHitProps {
  /** Whether the arrow flies in and hits. Without it the target just waits. */
  hit?: boolean
  /** Pixels to raise the target and the arrow, to leave room for more text below. */
  lift?: number
}

/**
 * Sheet 11: a faint sunburst, a target and an arrow that hits it. The target rebounds
 * (.92 → 1.05 → 1) and two rings spread out from it, the second 150 ms behind. It plays once
 * over 5 s, where the sheet loops, and stays on the hit. With reduced motion it is the still hit.
 */
export function ArrowHit({ hit = true, lift = 0 }: ArrowHitProps) {
  return (
    <>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        data-part="sunburst"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <g opacity="0.13">
          {RAYS.map((angle) => (
            <path
              key={angle}
              d="M192 192 L183 0 L201 0 Z"
              transform={`rotate(${angle} ${CENTER} ${CENTER})`}
              fill={color.gold}
            />
          ))}
          <circle
            cx={CENTER}
            cy={CENTER}
            r="120"
            fill="none"
            stroke={color.bronze}
            strokeWidth="2"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r="104"
            fill="none"
            stroke={color.bronze}
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </g>
      </svg>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        data-part="arrow-hit"
        data-hit={hit}
        style={{ position: 'absolute', left: 0, top: -lift }}
      >
        {hit ? (
          <>
            <circle
              className={`${styles.fb} ${styles.wave}`}
              cx={CENTER}
              cy={TARGET_Y}
              r="46"
              fill="none"
              stroke={color.gold}
              strokeWidth="2"
            />
            <circle
              className={`${styles.fb} ${styles.wave} ${styles.second}`}
              cx={CENTER}
              cy={TARGET_Y}
              r="46"
              fill="none"
              stroke={color.gold}
              strokeWidth="2"
            />
          </>
        ) : null}
        <g className={`${styles.fb} ${hit ? styles.target : ''}`}>
          <circle cx={CENTER} cy={TARGET_Y} r="46" fill={color.surface} />
          <circle
            cx={CENTER}
            cy={TARGET_Y}
            r="34"
            fill={color.screenBase}
            stroke={color.gold}
            strokeWidth="3"
          />
          <circle
            cx={CENTER}
            cy={TARGET_Y}
            r="21"
            fill={color.surface}
            stroke={color.gold}
            strokeWidth="3"
          />
          <circle cx={CENTER} cy={TARGET_Y} r="8" fill={color.ink} />
        </g>
        {hit ? (
          <g transform={`rotate(-32 ${CENTER} ${TARGET_Y})`}>
            <g className={`${styles.fb} ${styles.fly}`} data-part="arrow">
              <line
                x1="112"
                y1={TARGET_Y}
                x2="190"
                y2={TARGET_Y}
                stroke={color.ink}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 102 122 L 92 112 M 102 122 L 92 132 M 110 122 L 100 112 M 110 122 L 100 132"
                stroke={color.gold}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path d="M 194 122 L 180 114 L 184 122 L 180 130 Z" fill={color.ink} />
            </g>
          </g>
        ) : null}
      </svg>
    </>
  )
}
