import { geometry } from '../design/tokens'

/** Sheet 07: where the bow is drawn (its tips) and how far the string is pulled back. */
export const BOW_TIP_Y = 140
export const BOW_PULL_PX = 34
/** From the arrow's nock to its point. */
export const ARROW_LENGTH = 74

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

export interface RestGeometry {
  /** stroke-dashoffset of the arc: the ring empties clockwise as the rest runs. */
  dashOffset: number
  /** Where the string is held: it is drawn back as the rest runs out. */
  pullY: number
  /** Y of the arrow's nock, on the string, and of its point. */
  nockY: number
  tipY: number
  /** Y of the tail end of the shaft. */
  tailY: number
}

/** `progress` is the share of the rest already gone, from 0 to 1. */
export function restGeometry(progress: number): RestGeometry {
  const p = clamp01(progress)
  const pullY = BOW_TIP_Y + BOW_PULL_PX * p
  const tipY = pullY - ARROW_LENGTH
  return {
    dashOffset: Math.round(geometry.ringCircumference * p * 100) / 100,
    pullY,
    nockY: pullY,
    tipY,
    tailY: tipY + 10,
  }
}

const GRASS_BLADES = 27

export interface Blade {
  d: string
}

/** The grass of the backdrop: 27 blades along the bottom that lean in a repeating pattern. */
export function grassBlades(): Blade[] {
  return Array.from({ length: GRASS_BLADES }, (_, i) => {
    const x = 20 + 13 * i
    const endX = i % 3 === 1 ? x - 6 : x + 8
    const endY = i < 10 ? 338 + i : 318 + (i - 10)
    return { d: `M${x} 384 Q${x + 4} 340 ${endX} ${endY}` }
  })
}
