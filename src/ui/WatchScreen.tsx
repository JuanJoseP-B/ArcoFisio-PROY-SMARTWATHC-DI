import type { ReactNode } from 'react'
import type { ScreenTheme } from '../design/theme'
import styles from './WatchScreen.module.css'

interface WatchScreenProps {
  children?: ReactNode
  theme?: ScreenTheme
}

interface SafeZoneProps {
  children?: ReactNode
}

export function WatchScreen({ children, theme = 'classic' }: WatchScreenProps) {
  return (
    <div className={styles.screen} data-part="screen" data-theme={theme}>
      {children}
    </div>
  )
}

export function SafeZone({ children }: SafeZoneProps) {
  return (
    <div className={styles.safe} data-part="safe-zone">
      {children}
    </div>
  )
}
