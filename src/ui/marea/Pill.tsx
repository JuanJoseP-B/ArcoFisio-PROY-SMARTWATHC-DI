import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import styles from './Pill.module.css'

export type PillTone = 'blue' | 'mint' | 'amber' | 'rose'

interface PillProps {
  tone?: PillTone
  /** Optional 16 px icon before the text: a state is never carried by color alone. */
  icon?: IconName
  children: ReactNode
  /** Announced politely when the text changes, for live status. */
  live?: boolean
}

/** Status pill: tinted background, dark text of the same hue, optional icon. */
export function Pill({ tone = 'blue', icon, children, live = false }: PillProps) {
  return (
    <span
      className={`${styles.pill} ${styles[tone]}`}
      data-part="pill"
      data-tone={tone}
      role={live ? 'status' : undefined}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  )
}
