import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../../domain/constants'

/**
 * Geometry of the "Marea" dial (handoff 03). All values live in the 384 x 384 watch space,
 * centre (192, 192). The angle 0..180 degrees is drawn on the right half of the ring, from
 * the bottom (0) to the top (180), and the water surface sits at the same height as the marker.
 */
export const DIAL_SIZE = 384
export const DIAL_CENTER = 192
export const DIAL_RADIUS = 170

/** Half of the ring: the length of the track arc. */
export const DIAL_ARC_LENGTH = Math.PI * DIAL_RADIUS

/** Track arc from 0 degrees (bottom) to 180 degrees (top), counter-clockwise on screen. */
export const TRACK_PATH = `M${DIAL_CENTER} ${DIAL_CENTER + DIAL_RADIUS} A${DIAL_RADIUS} ${DIAL_RADIUS} 0 0 0 ${DIAL_CENTER} ${DIAL_CENTER - DIAL_RADIUS}`

/** One tick every 10 degrees: a 1.6 px dash followed by the rest of a tenth of the arc. */
export const TICK_DASH = `1.6 ${(DIAL_ARC_LENGTH / 18 - 1.6).toFixed(2)}`

/** Notch of the target runs from this x to the edge of the circle. */
const NOTCH_FROM_X = 342
const NOTCH_TO_X = 380

/** Vertical offset between the two wave layers of the water. */
export const WAVE_LAYER_GAP = 8

const clampAngle = (deg: number): number => Math.min(ANGLE_MAX_DEG, Math.max(ANGLE_MIN_DEG, deg))

const round1 = (n: number): number => Math.round(n * 10) / 10

export interface DialPoint {
  x: number
  y: number
}

/** Position on the ring of an angle: x = 192 + 170 sin, y = 192 + 170 cos. */
export function dialPoint(deg: number): DialPoint {
  const radians = (clampAngle(deg) * Math.PI) / 180
  return {
    x: round1(DIAL_CENTER + DIAL_RADIUS * Math.sin(radians)),
    y: round1(DIAL_CENTER + DIAL_RADIUS * Math.cos(radians)),
  }
}

/** Height of the water surface for an angle: the same y as the marker on the ring. */
export const waterLevelFor = (deg: number): number => dialPoint(deg).y

/** The thin mark on the rim that shows the target (handoff: `M342 y H380`). */
export function targetNotchPath(deg: number): string {
  return `M${NOTCH_FROM_X} ${dialPoint(deg).y}H${NOTCH_TO_X}`
}

/** Centre of the n-th of `count` round buttons on a ring, clockwise from twelve o'clock. */
export function ringButtonCenter(index: number, count: number, radius: number): DialPoint {
  const radians = (index * 2 * Math.PI) / count
  return {
    x: round1(DIAL_CENTER + radius * Math.sin(radians)),
    y: round1(DIAL_CENTER - radius * Math.cos(radians)),
  }
}

/** Water level the loading animation leaves behind: the level of 90 degrees. */
export const LOADING_END_LEVEL = 192

/** Water level of screens without a measurement, by tide phase (handoff 04). */
export const AMBIENT_WATER = {
  loading: 338,
  start: 318,
  prepare: 304,
  restFloor: 348,
  restCeiling: 258,
} as const
