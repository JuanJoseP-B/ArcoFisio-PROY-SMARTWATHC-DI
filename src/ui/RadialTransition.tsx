import type { ReactNode } from 'react'
import styles from './RadialTransition.module.css'

interface RadialTransitionProps {
  /** Changing this key remounts the content and plays the entrance again. */
  screenKey: string
  children?: ReactNode
}

/**
 * Screen entrance: scale 0.92 to 1 plus a fade from the center of the circle.
 * Nothing slides in from the straight edges; reduced motion keeps only the fade.
 */
export function RadialTransition({ screenKey, children }: RadialTransitionProps) {
  return (
    <div key={screenKey} className={styles.screen} data-part="radial-transition">
      {children}
    </div>
  )
}
