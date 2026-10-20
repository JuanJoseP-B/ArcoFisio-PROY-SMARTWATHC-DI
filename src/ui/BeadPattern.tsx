import { useId } from 'react'
import styles from './BeadPattern.module.css'

interface BeadPatternProps {
  width: number
  height: number
  opacity?: number
  x?: number
  y?: number
}

export function BeadPattern({ width, height, opacity = 0.9, x = 0, y = 0 }: BeadPatternProps) {
  const patternId = `bead-${useId().replace(/:/g, '')}`

  return (
    <g data-part="bead-pattern" opacity={opacity} aria-hidden="true">
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="24" height="16">
          <path className={styles.terracotta} d="M0 16 L12 2 L24 16 Z" />
          <path className={styles.surface} d="M8 16 L12 10 L16 16 Z" />
          <rect className={styles.turquoise} x="10" y="0" width="4" height="3" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${patternId})`} />
    </g>
  )
}
