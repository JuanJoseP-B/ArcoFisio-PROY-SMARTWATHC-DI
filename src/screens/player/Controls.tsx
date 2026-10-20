import { IconButton } from '../../ui/IconButton'
import type { IconName } from '../../ui/IconButton'
import styles from './Player.module.css'

export interface Control {
  icon: IconName
  /** Already translated. */
  label: string
  onPress(): void
}

interface ControlsProps {
  controls: readonly Control[]
}

/** The row of round buttons of the player, sitting inside the ring clear of its rim. */
export function Controls({ controls }: ControlsProps) {
  return (
    <div className={styles.actions} data-part="player-controls">
      {controls.map((control) => (
        <IconButton
          key={control.icon}
          icon={control.icon}
          label={control.label}
          onPress={control.onPress}
        />
      ))}
    </div>
  )
}
