import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../domain/constants'
import { SIM_GRAVITY } from './constants'
import type { AngleSource, PermissionResult, SampleListener, SensorMode, Vec3 } from './types'

const DEG_TO_RAD = Math.PI / 180

/** Gravity as a phone would read it when the arm is `angle` degrees from hanging. */
export function gravityForAngle(angle: number): Vec3 {
  const radians = angle * DEG_TO_RAD
  return [0, SIM_GRAVITY * Math.sin(radians), SIM_GRAVITY * Math.cos(radians)]
}

export class SimulatedSource implements AngleSource {
  readonly mode: SensorMode = 'sim'
  private readonly listeners = new Set<SampleListener>()
  private angle = 0
  private running = false

  get currentAngle(): number {
    return this.angle
  }

  setAngle(angle: number): void {
    this.angle = Math.max(ANGLE_MIN_DEG, Math.min(ANGLE_MAX_DEG, angle))
    if (this.running) this.emit()
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.emit()
  }

  stop(): void {
    this.running = false
  }

  onSample(listener: SampleListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  requestPermission(): Promise<PermissionResult> {
    return Promise.resolve('granted')
  }

  private emit(): void {
    const sample = gravityForAngle(this.angle)
    for (const listener of this.listeners) listener(sample)
  }
}
