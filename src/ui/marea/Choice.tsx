import type { ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Choice.module.css'

interface ChoiceGroupProps {
  /** Already translated name of the whole group. */
  label: string
  children: ReactNode
  /** Lay the options side by side (cards) or one under another (rows). */
  direction?: 'row' | 'column'
  part?: string
}

/** A group of exclusive options. Native radio inputs give the arrow keys and the group semantics. */
export function ChoiceGroup({ label, children, direction = 'column', part }: ChoiceGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={direction === 'row' ? styles.groupRow : styles.groupColumn}
      data-part={part ?? 'choice-group'}
    >
      {children}
    </div>
  )
}

interface ChoiceProps {
  /** Shared by the options of one group. */
  name: string
  value: string
  checked: boolean
  /** Already translated accessible name of the option. */
  label: string
  /** Already translated name of the check mark, announced with the selected option. */
  selectedLabel: string
  onSelect(value: string): void
  /** `row` is a list row (language); `card` is a tall option with a picture (exercise). */
  variant?: 'row' | 'card'
  children: ReactNode
}

/**
 * One option of a ChoiceGroup. The selected one has a border, a tinted fill and a check mark,
 * so the choice never depends on color alone. The real input sits under the box and shows the
 * focus ring on it.
 */
export function Choice({
  name,
  value,
  checked,
  label,
  selectedLabel,
  onSelect,
  variant = 'row',
  children,
}: ChoiceProps) {
  return (
    <label className={variant === 'card' ? styles.card : styles.row} data-part="choice">
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        aria-label={label}
        data-value={value}
        onChange={() => onSelect(value)}
      />
      <span className={styles.box} data-selected={checked}>
        {children}
        {checked ? (
          <span className={styles.check} role="img" aria-label={selectedLabel}>
            <Icon name="check" size={variant === 'card' ? 18 : 24} />
          </span>
        ) : null}
      </span>
    </label>
  )
}
