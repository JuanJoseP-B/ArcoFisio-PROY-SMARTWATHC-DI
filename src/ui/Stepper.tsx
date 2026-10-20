import styles from './Stepper.module.css'

interface StepperProps {
  /** Already translated name of the value, e.g. "Series". */
  label: string
  /** Already translated value as shown, e.g. "3" or "30 s". */
  valueText: string
  value: number
  min: number
  max: number
  step?: number
  /** Already translated names for the buttons, e.g. "Aumentar Series". */
  decreaseLabel: string
  increaseLabel: string
  onChange(value: number): void
}

/** Row of 232 x 48: a round minus, the name over the value, a round plus. Stops at min and max. */
export function Stepper({
  label,
  valueText,
  value,
  min,
  max,
  step = 1,
  decreaseLabel,
  increaseLabel,
  onChange,
}: StepperProps) {
  const lower = Math.max(min, value - step)
  const higher = Math.min(max, value + step)

  return (
    <div className={styles.stepper} role="group" aria-label={label} data-part="stepper">
      <button
        type="button"
        className={styles.button}
        aria-label={decreaseLabel}
        disabled={value <= min}
        data-action="decrease"
        onClick={() => onChange(lower)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12 L19 12" />
        </svg>
      </button>
      <div className={styles.readout} aria-live="polite">
        <span className={styles.label}>{label}</span>
        <span className={styles.value} data-part="stepper-value">
          {valueText}
        </span>
      </div>
      <button
        type="button"
        className={styles.button}
        aria-label={increaseLabel}
        disabled={value >= max}
        data-action="increase"
        onClick={() => onChange(higher)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12 L19 12 M12 5 L12 19" />
        </svg>
      </button>
    </div>
  )
}
