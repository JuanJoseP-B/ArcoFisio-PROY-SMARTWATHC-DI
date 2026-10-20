import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../design/reducedMotion'
import styles from './PillButton.module.css'
import { PRESS_DELAY_MS } from './pressTiming'

interface PillButtonProps {
  /** Already translated, one line. */
  label: string
  variant?: 'primary' | 'secondary'
  onPress(): void
}

/**
 * Sheet 09. Primary (232 x 52): the arrow draws back and flies out along a gold trail, and the
 * action runs a moment later so the shot can be seen. Secondary (200 x 48) is outlined and
 * acts at once. With reduced motion both act at once and nothing animates.
 */
export function PillButton({ label, variant = 'primary', onPress }: PillButtonProps) {
  const reduced = usePrefersReducedMotion()
  const [pressed, setPressed] = useState(false)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onPressRef = useRef(onPress)

  useEffect(() => {
    onPressRef.current = onPress
  })

  useEffect(
    () => () => {
      if (pending.current !== null) clearTimeout(pending.current)
    },
    [],
  )

  const primary = variant === 'primary'

  const handleClick = () => {
    if (pending.current !== null) return
    if (!primary || reduced) {
      onPress()
      return
    }
    setPressed(true)
    pending.current = setTimeout(() => {
      pending.current = null
      onPressRef.current()
    }, PRESS_DELAY_MS)
  }

  const className = [
    styles.btn,
    primary ? styles.primary : styles.secondary,
    pressed && styles.pressed,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      data-part="pill-button"
      data-variant={variant}
      onClick={handleClick}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setPressed(false)
      }}
    >
      {primary ? (
        <>
          <span className={styles.ripple} aria-hidden="true" />
          <span className={styles.trail} aria-hidden="true" />
          <svg
            className={styles.shot}
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="2" y1="8" x2="25" y2="8" />
            <path d="M20 3 L26 8 L20 13" />
            <path className={styles.fletching} d="M2 8 L-2 4 M2 8 L-2 12 M7 8 L3 4 M7 8 L3 12" />
          </svg>
        </>
      ) : null}
      <span className={styles.label}>{label}</span>
    </button>
  )
}
