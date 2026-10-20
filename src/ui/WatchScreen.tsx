import type { ReactNode } from 'react'
import styles from './WatchScreen.module.css'

interface WatchScreenProps {
  children?: ReactNode
}

export function WatchScreen({ children }: WatchScreenProps) {
  return (
    <div className={styles.screen} data-part="screen">
      {children}
    </div>
  )
}

export function SafeZone({ children }: WatchScreenProps) {
  return (
    <div className={styles.safe} data-part="safe-zone">
      {children}
    </div>
  )
}
