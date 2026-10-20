import type { SensorMode } from '../data/types'
import type { Vec3 } from '../domain/vector'

export type { SensorMode, Vec3 }

export type PermissionResult = 'granted' | 'denied' | 'unsupported'

export type SampleListener = (sample: Vec3) => void

export interface AngleSource {
  readonly mode: SensorMode
  start(): void
  stop(): void
  onSample(listener: SampleListener): () => void
  requestPermission(): Promise<PermissionResult>
}
