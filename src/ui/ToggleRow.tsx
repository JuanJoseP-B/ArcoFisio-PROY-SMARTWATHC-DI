import styles from './ToggleRow.module.css'

interface ToggleRowProps {
  /** Already translated name of the setting, e.g. "Sonido". */
  label: string
  /** Already translated state as shown, e.g. "Activado": the state never rests on color alone. */
  stateText: string
  checked: boolean
  onChange(checked: boolean): void
}

/** Row of 232 x 48 with a name, its state in words and a switch. One press flips it. */
export function ToggleRow({ label, stateText, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles.row}
      data-part="toggle-row"
      data-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.state} data-part="toggle-state">
          {stateText}
        </span>
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  )
}
