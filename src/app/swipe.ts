export interface PointerPoint {
  readonly x: number
  readonly y: number
  readonly t: number
}

/** The gesture must finish within this time, in ms. */
export const SWIPE_MAX_MS = 800
/** Sideways travel needed, as a fraction of the screen width. */
export const SWIPE_MIN_FRACTION = 0.18
/** How much vertical drift still counts as a horizontal swipe. */
export const SWIPE_MAX_SLOPE = 0.6

/**
 * A quick left-to-right swipe means "back". `width` is the on-screen width of the watch, so the
 * distance needed scales with it.
 */
export function isSwipeBack(start: PointerPoint, end: PointerPoint, width: number): boolean {
  const dx = end.x - start.x
  const dy = Math.abs(end.y - start.y)
  return (
    dx >= width * SWIPE_MIN_FRACTION &&
    dy <= dx * SWIPE_MAX_SLOPE &&
    end.t - start.t <= SWIPE_MAX_MS
  )
}
