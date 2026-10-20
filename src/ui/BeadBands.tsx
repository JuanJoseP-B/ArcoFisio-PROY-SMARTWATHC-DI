import { useId } from 'react'
import { geometry } from '../design/tokens'
import styles from './BeadBands.module.css'

const SIZE = geometry.screenSize
const BAND = 56

/** Two faint bead-pattern bands, top and bottom of the screen (backdrop of sheets 05 and 08). */
export function BeadBands() {
  const patternId = `bands-${useId().replace(/:/g, '')}`

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-part="bead-bands"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="32" height="28">
          <path className={styles.terracotta} d="M0 28 L16 6 L32 28 Z" />
          <path className={styles.light} d="M10 28 L16 19 L22 28 Z" />
          <rect className={styles.turquoise} x="14" y="0" width="4" height="4" />
        </pattern>
      </defs>
      <g opacity="0.12">
        <rect x="0" y="0" width={SIZE} height={BAND} fill={`url(#${patternId})`} />
        <rect
          x="0"
          y={SIZE - BAND}
          width={SIZE}
          height={BAND}
          fill={`url(#${patternId})`}
          transform={`rotate(180 ${SIZE / 2} ${SIZE - BAND / 2})`}
        />
      </g>
    </svg>
  )
}
