import { dot, normalize } from './vector'
import type { Vec3 } from './vector'

export interface AngleCalibration {
  readonly gravityRef: Vec3
}

const RAD_TO_DEG = 180 / Math.PI

export function computeAngle(sample: Vec3, calibration: AngleCalibration): number | null {
  const current = normalize(sample)
  const reference = normalize(calibration.gravityRef)
  if (!current || !reference) return null

  const cosine = Math.max(-1, Math.min(1, dot(current, reference)))
  return Math.acos(cosine) * RAD_TO_DEG
}
