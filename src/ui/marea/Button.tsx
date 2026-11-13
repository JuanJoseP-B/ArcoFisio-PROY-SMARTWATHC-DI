import type { ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link' | 'danger'

interface ButtonProps {
  /** Already translated, one line. */
  children: ReactNode
  variant?: ButtonVariant
  onPress(): void
  /** Minimum width in px, so stacked buttons line up (handoff: 130 to 170). */
  minWidth?: number
  /** Compact height for the buttons in the menu centre (44 px). */
  compact?: boolean
  disabled?: boolean
  /** Short stable name for tests and scripts. */
  part?: string
  autoFocus?: boolean
}

/**
 * Pill button of the Marea set: 48 px high (the link style 40 px), DM Sans bold. Always a real
 * `button`, so Enter and Space work and the focus ring shows.
 */
export function Button({
  children,
  variant = 'primary',
  onPress,
  minWidth,
  compact = false,
  disabled = false,
  part,
  autoFocus,
}: ButtonProps) {
  const className = [styles.btn, styles[variant], compact ? styles.compact : '']
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      className={className}
      style={minWidth ? { minWidth } : undefined}
      disabled={disabled}
      data-part={part ?? 'button'}
      data-variant={variant}
      autoFocus={autoFocus}
      onClick={onPress}
    >
      {children}
    </button>
  )
}
