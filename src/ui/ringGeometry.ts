import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../domain/constants'
import { geometry } from '../design/tokens'
import type { PainArc, Zone } from '../domain/zones'

const CENTER = geometry.screenSize / 2
const TOP = CENTER - geometry.ringRadius

export interface RingGeometry {
  /** stroke-dashoffset that leaves `angle / 360` of the circumference painted from the top. */
  dashOffset: number
  /** End of the dotted string: the point of the ring at `angle`, clockwise from the top. */
  tipX: number
  tipY: number
  stringOpacity: number
}

export const clampAngle = (angle: number): number =>
  Math.max(ANGLE_MIN_DEG, Math.min(ANGLE_MAX_DEG, angle))

/** Numbers of the goniometer sheet (02): the angle fills `angle / 360` of the ring. */
export function ringGeometry(angle: number): RingGeometry {
  const a = clampAngle(angle)
  const radians = (a * Math.PI) / 180
  return {
    dashOffset: geometry.ringCircumference * (1 - a / 360),
    tipX: CENTER + geometry.ringRadius * Math.sin(radians),
    tipY: CENTER - geometry.ringRadius * Math.cos(radians),
    stringOpacity: a > 6 ? 0.45 : 0,
  }
}

/** Y of the ring's top, where the knob and the target marker sit before being rotated. */
export const RING_TOP_Y = TOP
export const RING_CENTER = CENTER

/** Radius of the target marker: it swells when the arm is close and again on the target. */
export function targetRadius(zone: Zone | null | undefined): number {
  if (zone === 'target') return 14
  if (zone === 'near') return 11
  return 9
}

export interface PainBandGeometry {
  /** stroke-dasharray that paints `to - from` degrees of the ring and leaves the rest bare. */
  dashArray: string
  /** stroke-dashoffset that moves the painted piece to `from`, clockwise from the top. */
  dashOffset: number
  /** Degrees of the band the arm has already covered, 0 when it has not reached it. */
  reached: number
}

/** Sheet 04: the painful band is a piece of the ring from `from` to `to`. */
export function painBandGeometry(arc: PainArc, angle: number): PainBandGeometry {
  const from = clampAngle(arc.from)
  const to = clampAngle(arc.to)
  const perDegree = geometry.ringCircumference / 360
  const length = Math.max(0, to - from) * perDegree
  return {
    dashArray: `${length.toFixed(2)} ${geometry.ringCircumference}`,
    dashOffset: -from * perDegree,
    reached: Math.max(0, Math.min(clampAngle(angle), to) - from),
  }
}
