import type { ReactNode } from 'react'
import styles from './WatchBezel.module.css'

interface WatchBezelProps {
  children: ReactNode
}

export function WatchBezel({ children }: WatchBezelProps) {
  return (
    <div className={styles.bezel} data-part="bezel">
      {children}
      <div className={styles.glass} data-part="glass" aria-hidden="true" />
    </div>
  )
}
