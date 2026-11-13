import { Icon } from './Icon'
import styles from './RoundStepper.module.css'
import text from './Text.module.css'
import { useStepper } from './useStepper'

interface RoundStepperProps {
  /** Already translated name of the value; it names the whole group. */
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** The value as shown, already formatted, e.g. "90°" or "30 s". */
  valueText: string
  /** Already translated names of the two buttons, e.g. "Bajar 5 grados". */
  decreaseLabel: string
  increaseLabel: string
  onChange(value: number): void
}

/**
 * `-  value  +` selector (handoff 05, screen 07): two 56 px round buttons around the figure.
 * Holding a button repeats the step; the arrow keys step the value from either button.
 */
export function RoundStepper({
  label,
  value,
  min,
  max,
  step = 1,
  valueText,
  decreaseLabel,
  increaseLabel,
  onChange,
}: RoundStepperProps) {
  const stepper = useStepper({ value, min, max, step, onChange })

  return (
    <div
      className={styles.stepper}
      role="group"
      aria-label={label}
      data-part="round-stepper"
      onKeyDown={stepper.onKeyDown}
    >
      <button
        type="button"
        className={styles.button}
        aria-label={decreaseLabel}
        disabled={value <= min}
        data-action="decrease"
        onClick={() => stepper.press(-1)}
        {...stepper.holdProps(-1)}
      >
        <Icon name="minus" size={28} />
      </button>
      <output className={`${text.mid} ${styles.value}`} data-part="stepper-value">
        {valueText}
      </output>
      <button
        type="button"
        className={styles.button}
        aria-label={increaseLabel}
        disabled={value >= max}
        data-action="increase"
        onClick={() => stepper.press(1)}
        {...stepper.holdProps(1)}
      >
        <Icon name="plus" size={28} />
      </button>
    </div>
  )
}
