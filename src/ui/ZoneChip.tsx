import type { Zone } from '../domain/zones'
import styles from './ZoneChip.module.css'
import { ZoneIcon } from './ZoneIcon'

interface ZoneChipProps {
  zone: Zone
  /** Already translated word for the zone; color never stands alone. */
  label: string
  /** Show the sheet 05 micro-gesture next to the word. Defaults to true. */
  icon?: boolean
}

/** Pill under the angle reading: a word plus a small animated bow for the current zone. */
export function ZoneChip({ zone, label, icon = true }: ZoneChipProps) {
  return (
    <div className={styles.chip} data-part="zone-chip" data-zone={zone} role="status">
      {icon ? <ZoneIcon zone={zone} /> : null}
      <span>{label}</span>
    </div>
  )
}
