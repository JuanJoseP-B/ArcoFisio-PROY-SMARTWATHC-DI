import { requestMotionPermission } from './permission'
import type { MotionEnv } from './support'
import type { AngleSource, PermissionResult, SampleListener, SensorMode, Vec3 } from './types'

interface MotionEventLike {
  accelerationIncludingGravity?: {
    x: number | null
    y: number | null
    z: number | null
  } | null
}

export interface MotionTarget {
  addEventListener(type: 'devicemotion', listener: (event: MotionEventLike) => void): void
  removeEventListener(type: 'devicemotion', listener: (event: MotionEventLike) => void): void
}

export interface DeviceMotionOptions {
  target?: MotionTarget
  env?: MotionEnv
}

export function readGravity(event: MotionEventLike): Vec3 | null {
  const a = event.accelerationIncludingGravity
  if (!a) return null
  const { x, y, z } = a
  if (x === null || y === null || z === null) return null
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null
  return [x, y, z]
}

export class DeviceMotionSource implements AngleSource {
  readonly mode: SensorMode = 'device'
  private readonly listeners = new Set<SampleListener>()
  private readonly options: DeviceMotionOptions
  private running = false

  constructor(options: DeviceMotionOptions = {}) {
    this.options = options
  }

  private readonly handleMotion = (event: MotionEventLike): void => {
    const sample = readGravity(event)
    if (!sample) return
    for (const listener of this.listeners) listener(sample)
  }

  private get target(): MotionTarget {
    return this.options.target ?? (window as unknown as MotionTarget)
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.target.addEventListener('devicemotion', this.handleMotion)
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    this.target.removeEventListener('devicemotion', this.handleMotion)
  }

  onSample(listener: SampleListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  requestPermission(): Promise<PermissionResult> {
    return requestMotionPermission(this.options.env)
  }
}
