import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from './constants'

/** The wheel clicks into place every this many degrees (sheet 03). */
export const WHEEL_STEP_DEG = 5

/** The nearest detent inside 0..180. */
export function snapAngle(value: number): number {
  if (!Number.isFinite(value)) return ANGLE_MIN_DEG
  const snapped = Math.round(value / WHEEL_STEP_DEG) * WHEEL_STEP_DEG
  return Math.min(ANGLE_MAX_DEG, Math.max(ANGLE_MIN_DEG, snapped))
}

/** Moves `steps` detents (negative goes down) and stops at both ends of the scale. */
export function stepAngle(value: number, steps: number): number {
  return snapAngle(snapAngle(value) + steps * WHEEL_STEP_DEG)
}

/** Shortest signed turn from one direction to another, in degrees (-180..180]. */
export function turnBetween(fromDeg: number, toDeg: number): number {
  const turn = (((toDeg - fromDeg) % 360) + 360) % 360
  return turn > 180 ? turn - 360 : turn
}

/**
 * Value after dragging the wheel. The wheel turns by `-value`, so pulling its rim clockwise
 * (a growing pointer direction) lowers the value, like turning a dial under the thumb.
 */
export function dragValue(startValue: number, startPointerDeg: number, pointerDeg: number): number {
  return snapAngle(startValue - turnBetween(startPointerDeg, pointerDeg))
}

/** Direction of a point around a centre, in degrees clockwise from straight up. */
export function pointerDirection(cx: number, cy: number, x: number, y: number): number {
  return (Math.atan2(x - cx, cy - y) * 180) / Math.PI
}
