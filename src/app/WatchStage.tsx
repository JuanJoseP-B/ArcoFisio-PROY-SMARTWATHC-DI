import type { ReactNode } from 'react'
import { watchExtent } from '../design/tokens'
import { computeFitScale } from './fitScale'
import styles from './WatchStage.module.css'
import { useViewportSize } from './useViewportSize'

interface WatchStageProps {
  children: ReactNode
}

export function WatchStage({ children }: WatchStageProps) {
  const { width, height } = useViewportSize()
  const scale = computeFitScale(width, height)
  const side = watchExtent * scale

  return (
    <div className={styles.stage} data-part="stage">
      <div className={styles.frame} style={{ width: side, height: side }}>
        <div className={styles.scaler} style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
