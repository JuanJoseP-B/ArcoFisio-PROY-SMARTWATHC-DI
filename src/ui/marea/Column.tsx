import type { CSSProperties, ReactNode } from 'react'
import styles from './Column.module.css'

interface ColumnProps {
  children: ReactNode
  /** Space between the elements, in px (handoff: 6 to 10). */
  gap?: number
  /** Horizontal padding, in px; the central column is about 270 px wide (padding 54). */
  padding?: number
  /** Extra padding on top, in px, to move the block down a little. */
  top?: number
  part?: string
}

/** The central content column of a Marea screen: centred both ways, inside the safe zone. */
export function Column({ children, gap = 7, padding = 54, top = 0, part }: ColumnProps) {
  const style: CSSProperties = { gap, padding: `${top}px ${padding}px 0` }
  return (
    <div className={styles.column} style={style} data-part={part ?? 'column'}>
      {children}
    </div>
  )
}
