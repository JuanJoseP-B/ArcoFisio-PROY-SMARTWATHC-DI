import type { ReactNode } from 'react'
import type { ScreenTheme } from '../design/theme'
import styles from './WatchBezel.module.css'

interface WatchBezelProps {
  children: ReactNode
  /** Marea draws no hardware: the circle stands on its own, as in the handoff. */
  theme?: ScreenTheme
}

export function WatchBezel({ children, theme = 'classic' }: WatchBezelProps) {
  return (
    <div className={styles.bezel} data-part="bezel" data-theme={theme}>
      {children}
      <div className={styles.glass} data-part="glass" aria-hidden="true" />
    </div>
  )
}
