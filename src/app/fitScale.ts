import { watchExtent } from '../design/tokens'

export const STAGE_MARGIN = 16
export const MAX_SCALE = 1

export function computeFitScale(viewportWidth: number, viewportHeight: number): number {
  const available = Math.min(viewportWidth, viewportHeight) - 2 * STAGE_MARGIN
  if (!Number.isFinite(available) || available <= 0) return 0
  return Math.min(MAX_SCALE, available / watchExtent)
}
