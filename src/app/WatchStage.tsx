import type { ReactNode } from 'react'
import { watchExtent } from '../design/tokens'
import type { ScreenTheme } from '../design/theme'
import { computeFitScale } from './fitScale'
import styles from './WatchStage.module.css'
import { useViewportSize } from './useViewportSize'

interface WatchStageProps {
  children: ReactNode
  /** Look of the screen on show: it sets the color of the surface around the watch. */
  theme?: ScreenTheme
}

export function WatchStage({ children, theme = 'classic' }: WatchStageProps) {
  const { width, height } = useViewportSize()
  const scale = computeFitScale(width, height)
  const side = watchExtent * scale

  return (
    <div className={styles.stage} data-part="stage" data-theme={theme}>
      <div className={styles.frame} style={{ width: side, height: side }}>
        <div className={styles.scaler} style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
