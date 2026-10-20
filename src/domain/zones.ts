import { APPROACH_MARGIN_DEG, NEAR_MARGIN_DEG } from './constants'

export type Zone = 'far' | 'approach' | 'near' | 'target' | 'overshoot' | 'pain' | 'rest'
export type AngleZone = Exclude<Zone, 'rest'>

export interface PainArc {
  readonly from: number
  readonly to: number
}

export const isOnTarget = (angle: number, target: number, tolerance: number): boolean =>
  Math.abs(angle - target) <= tolerance

export const isOvershoot = (angle: number, target: number, tolerance: number): boolean =>
  angle > target + tolerance

const isInPainArc = (angle: number, painArc: PainArc | null): boolean =>
  painArc !== null && angle >= painArc.from && angle <= painArc.to

export function classifyZone(
  angle: number,
  target: number,
  tolerance: number,
  painArc: PainArc | null,
): AngleZone {
  if (isOnTarget(angle, target, tolerance)) return 'target'
  if (isOvershoot(angle, target, tolerance)) return 'overshoot'
  if (isInPainArc(angle, painArc)) return 'pain'
  if (angle >= target - NEAR_MARGIN_DEG) return 'near'
  if (angle >= target - APPROACH_MARGIN_DEG) return 'approach'
  return 'far'
}
