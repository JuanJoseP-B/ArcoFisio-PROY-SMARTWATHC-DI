import styles from './ConfirmButton.module.css'

interface ConfirmButtonProps {
  /** Translated name, e.g. "Continuar"; the button shows only a check mark. */
  label: string
  onConfirm(): void
}

/** 48 px round "done" button at the bottom of the circle, in the colors of a primary action. */
export function ConfirmButton({ label, onConfirm }: ConfirmButtonProps) {
  return (
    <button
      type="button"
      className={styles.confirm}
      aria-label={label}
      data-part="confirm-button"
      onClick={onConfirm}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5 L10 17.5 L19 7" />
      </svg>
    </button>
  )
}
