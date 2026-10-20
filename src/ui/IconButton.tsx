import styles from './IconButton.module.css'

export type IconName =
  | 'back'
  | 'reset'
  | 'calibrate'
  | 'play'
  | 'pause'
  | 'next'
  | 'stop'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'history'

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
  play: ['M8 5 L19 12 L8 19 Z'],
  pause: ['M8 5 L8 19', 'M16 5 L16 19'],
  next: ['M5 5 L14 12 L5 19 Z', 'M19 5 L19 19'],
  stop: ['M6 6 L18 6 L18 18 L6 18 Z'],
  plus: ['M12 5 L12 19', 'M5 12 L19 12'],
  edit: ['M4 20 L5 15 L16 4 L20 8 L9 19 Z', 'M13 7 L17 11'],
  history: ['M12 4 A8 8 0 1 1 12 20 A8 8 0 1 1 12 4', 'M12 8 L12 12 L15 14'],
  trash: [
    'M5 7 L19 7',
    'M10 7 L10 4 L14 4 L14 7',
    'M7 7 L8 20 L16 20 L17 7',
    'M10 11 L10 16',
    'M14 11 L14 16',
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
