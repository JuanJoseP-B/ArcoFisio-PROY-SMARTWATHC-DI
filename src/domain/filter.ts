import { ANGLE_MAX_DEG, ANGLE_MIN_DEG, FILTER_ALPHA, FILTER_DEAD_ZONE_DEG } from './constants'

export interface FilterConfig {
  readonly alpha: number
  readonly deadZone: number
}

export const DEFAULT_FILTER: FilterConfig = {
  alpha: FILTER_ALPHA,
  deadZone: FILTER_DEAD_ZONE_DEG,
}

export const clampAngle = (angle: number): number =>
  Math.max(ANGLE_MIN_DEG, Math.min(ANGLE_MAX_DEG, angle))

export function filterAngle(
  previous: number | null,
  raw: number,
  config: FilterConfig = DEFAULT_FILTER,
): number {
  const target = clampAngle(raw)
  if (previous === null) return target

  const delta = target - previous
  if (Math.abs(delta) < config.deadZone) return previous
  return clampAngle(previous + config.alpha * delta)
}
