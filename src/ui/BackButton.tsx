import styles from './BackButton.module.css'

interface BackButtonProps {
  /** Translated name, e.g. "Atrás"; the button shows only an arrow. */
  label: string
  onBack(): void
  /** Where it sits inside the circle. Defaults to the top. */
  placement?: 'top' | 'bottom'
}

/** 48 px round back button inside the safe zone. */
export function BackButton({ label, onBack, placement = 'top' }: BackButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.back} ${placement === 'top' ? styles.top : styles.bottom}`}
      aria-label={label}
      data-part="back-button"
      data-placement={placement}
      onClick={onBack}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 5 L7 12 L14 19" />
        <path d="M7 12 L20 12" />
      </svg>
    </button>
  )
}
