import styles from './IconButton.module.css'

export type IconName = 'back' | 'reset' | 'calibrate'

interface IconButtonProps {
  icon: IconName
  /** Translated name; the button shows only the icon. */
  label: string
  onPress(): void
  disabled?: boolean
}

const PATHS: Record<IconName, string[]> = {
  back: ['M14 5 L7 12 L14 19', 'M7 12 L20 12'],
  reset: ['M4 12 A8 8 0 1 0 7 5.8', 'M4 4 L4 9 L9 9'],
  calibrate: [
    'M12 4 L12 8',
    'M12 16 L12 20',
    'M4 12 L8 12',
    'M16 12 L20 12',
    'M12 9.5 A2.5 2.5 0 1 1 12 14.5 A2.5 2.5 0 1 1 12 9.5',
  ],
}

/** 48 px round button with a line icon. It sits where its parent puts it. */
export function IconButton({ icon, label, onPress, disabled = false }: IconButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      disabled={disabled}
      data-part="icon-button"
      data-icon={icon}
      onClick={onPress}
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
        {PATHS[icon].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </button>
  )
}
