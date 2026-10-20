import { geometry } from '../design/tokens'

/** More repetitions than this share segments, so each one stays a readable arc. */
export const MAX_STEP_SEGMENTS = 20
/** Empty arc between two segments, in degrees (sheet 06: 36 degree segments, 29.8 painted). */
export const STEP_GAP_DEG = 6.2

export type StepState = 'done' | 'active' | 'todo'

export interface StepSegment {
  state: StepState
  /** Painted length, in ring units. */
  dash: number
  /** stroke-dashoffset that starts the segment at its place on the ring. */
  offset: number
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const segmentCount = (total: number): number =>
  clamp(Math.floor(total), 1, MAX_STEP_SEGMENTS)

/** Segments already closed: all of them only when every repetition is done. */
export function completedSegments(done: number, total: number): number {
  const count = segmentCount(total)
  if (total <= 0) return 0
  return Math.floor((clamp(done, 0, total) * count) / total)
}

/**
 * Sheet 06: the ring is split into one segment per repetition (up to 20). Closed segments are
 * dark, the one being worked on is gold and the rest are pale.
 */
export function stepSegments(done: number, total: number): StepSegment[] {
  const count = segmentCount(total)
  const closed = completedSegments(done, total)
  const pitch = 360 / count
  const dash = (geometry.ringCircumference * Math.max(pitch - STEP_GAP_DEG, 0.5)) / 360

  return Array.from({ length: count }, (_, index) => ({
    state: index < closed ? 'done' : index === closed ? 'active' : 'todo',
    dash: Math.round(dash * 100) / 100,
    offset:
      Math.round(((-geometry.ringCircumference * (index * pitch + STEP_GAP_DEG / 2)) / 360) * 100) /
      100,
  }))
}

/** Angle, clockwise from the top, the arrow of a closing segment is aimed at. */
export function aimAngle(done: number, total: number): number {
  const count = segmentCount(total)
  const index = Math.max(completedSegments(done, total) - 1, 0)
  return (index + 0.5) * (360 / count)
}
