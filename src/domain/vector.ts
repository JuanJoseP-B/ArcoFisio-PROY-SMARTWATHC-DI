import { MIN_GRAVITY_NORM } from './constants'

export type Vec3 = readonly [number, number, number]

export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const norm = (v: Vec3): number => Math.hypot(v[0], v[1], v[2])

export function normalize(v: Vec3): Vec3 | null {
  const length = norm(v)
  if (!Number.isFinite(length) || length < MIN_GRAVITY_NORM) return null
  return [v[0] / length, v[1] / length, v[2] / length]
}
