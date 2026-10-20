import { useState } from 'react'
import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../domain/constants'
import { getSensorKit } from '../sensors/kit'
import type { SensorKit } from '../sensors/kit'
import styles from './SimulatorPanel.module.css'
import { useI18n } from './useI18n'

interface SimulatorPanelProps {
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
}

/**
 * Slider that drives the simulated arm angle. It lives outside the watch circle and only
 * exists in simulator mode (?sim=1), to rehearse without a phone.
 */
export function SimulatorPanel({ kit = getSensorKit() }: SimulatorPanelProps) {
  const { t } = useI18n()
  const [angle, setAngle] = useState(() => Math.round(kit.simulated?.currentAngle ?? 0))
  const simulated = kit.simulated
  if (!simulated) return null

  return (
    <div className={styles.panel} data-part="simulator-panel">
      <input
        className={styles.slider}
        type="range"
        min={ANGLE_MIN_DEG}
        max={ANGLE_MAX_DEG}
        step={1}
        value={angle}
        aria-label={t('sim.angle')}
        onChange={(event) => {
          const next = Number(event.target.value)
          setAngle(next)
          simulated.setAngle(next)
        }}
      />
      <span className={styles.value}>{angle}°</span>
    </div>
  )
}
