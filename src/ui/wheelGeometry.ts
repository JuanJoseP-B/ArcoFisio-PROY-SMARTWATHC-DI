import { ANGLE_MAX_DEG } from '../domain/constants'
import { WHEEL_STEP_DEG } from '../domain/wheel'

export const WHEEL_CENTER = 192
export const WHEEL_TICK_COUNT = 360 / WHEEL_STEP_DEG
/** Every this many degrees the tick is long, dark and labelled. */
export const WHEEL_MAJOR_DEG = 30

export interface WheelTick {
  angle: number
  major: boolean
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface WheelLabel {
  angle: number
  x: number
  y: number
}

/** A point at `radius` from the centre, `angleDeg` clockwise from straight up. */
export function wheelPoint(angleDeg: number, radius: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [WHEEL_CENTER + radius * Math.sin(rad), WHEEL_CENTER - radius * Math.cos(rad)]
}

const round1 = (n: number): number => Math.round(n * 10) / 10

/** The 72 marks of the rim: one per detent, long every 30 degrees. */
export function wheelTicks(): WheelTick[] {
  return Array.from({ length: WHEEL_TICK_COUNT }, (_, k) => {
    const angle = k * WHEEL_STEP_DEG
    const major = angle % WHEEL_MAJOR_DEG === 0
    const [x1, y1] = wheelPoint(angle, major ? 146 : 154)
    const [x2, y2] = wheelPoint(angle, 168)
    return { angle, major, x1: round1(x1), y1: round1(y1), x2: round1(x2), y2: round1(y2) }
  })
}

/** Degree labels for the long ticks that fall on the scale (0..180). */
export function wheelLabels(): WheelLabel[] {
  return wheelTicks()
    .filter((tick) => tick.major && tick.angle <= ANGLE_MAX_DEG)
    .map((tick) => {
      const [x, y] = wheelPoint(tick.angle, 128)
      return { angle: tick.angle, x: round1(x), y: round1(y) }
    })
}

/** The wheel turns against the value, so the chosen angle sits under the arrow at the top. */
export const wheelRotation = (value: number): number => -value
