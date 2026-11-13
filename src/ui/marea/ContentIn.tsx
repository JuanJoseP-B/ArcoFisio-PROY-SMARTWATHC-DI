import type { ReactNode } from 'react'
import styles from './ContentIn.module.css'

interface ContentInProps {
  /** Changing this key remounts the content and plays the entrance again. */
  screenKey: string
  children?: ReactNode
}

/**
 * Screen entrance of Marea (handoff 04): the content fades in and rises 10 px in 240 ms while
 * the water slides to its new level. With reduced motion it is a 150 ms fade.
 */
export function ContentIn({ screenKey, children }: ContentInProps) {
  return (
    <div key={screenKey} className={styles.content} data-part="content-in">
      {children}
    </div>
  )
}
