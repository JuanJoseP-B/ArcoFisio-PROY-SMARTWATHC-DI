import { useEffect, useState } from 'react'
import { createWakeLock } from '../feedback/wakeLock'
import { getSensorKit } from '../sensors/kit'
import styles from './SensorProbe.module.css'
import { useAngle } from './useAngle'

/**
 * TEMPORARY (stage 4): bare-bones screen to check the tilt sensor on a real phone.
 * Open the app with ?probe=1 (add &sim=1 on a computer). Strings are not translated
 * on purpose; this screen is removed once the Session screen exists (stage 6).
 */
export function SensorProbe() {
  const { angle, status, mode, actions } = useAngle()
  const [message, setMessage] = useState('')
  const simulated = getSensorKit().simulated

  useEffect(() => {
    const lock = createWakeLock()
    void lock.acquire()
    return () => {
      void lock.release()
    }
  }, [])

  const calibrate = async () => {
    const result = await actions.calibrate()
    setMessage(result.ok ? 'ok: 0°' : `fail: ${result.reason}`)
  }

  const askPermission = async () => {
    setMessage(await actions.requestPermission())
  }

  return (
    <div className={styles.probe}>
      <div className={styles.angle}>{angle === null ? '--' : `${angle.toFixed(1)}°`}</div>
      <div className={styles.status}>{`${mode} · ${status}`}</div>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={askPermission}>
          Sensor
        </button>
        <button type="button" className={styles.button} onClick={calibrate}>
          0°
        </button>
      </div>
      {simulated ? (
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={180}
          defaultValue={0}
          aria-label="angle"
          onChange={(event) => simulated.setAngle(Number(event.target.value))}
        />
      ) : null}
      <div className={styles.note}>{message}</div>
    </div>
  )
}
