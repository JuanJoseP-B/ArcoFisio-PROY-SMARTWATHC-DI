import { geometry } from '../design/tokens'

export type LauncherId =
  'measure' | 'session' | 'routines' | 'summary' | 'pain' | 'guide' | 'settings'

export interface HexCell {
  readonly id: LauncherId
  /** Offset from the center of the screen, in px (honeycomb of sheet 08). */
  readonly dx: number
  readonly dy: number
  /** 24 x 24 stroke icon path. */
  readonly icon: string
}

/** Spec order (§7); it is also the tab order. */
export const HEX_CELLS: readonly HexCell[] = [
  {
    id: 'measure',
    dx: 0,
    dy: 0,
    icon: 'M8 4 Q20 12 8 20 M8 4 L8 20 M4 12 L21 12 M18 9 L21 12 L18 15',
  },
  { id: 'session', dx: 96, dy: 0, icon: 'M4 18 A10 10 0 0 1 20 10 M16 7 L20 10 L16 13' },
  {
    id: 'routines',
    dx: -96,
    dy: 0,
    icon: 'M7 21 L10 8 L16 8 L19 21 Z M10 8 L8 3 M13 8 L13 2 M16 8 L18 3',
  },
  {
    id: 'summary',
    dx: 48,
    dy: -83,
    icon: 'M12 3 A9 9 0 1 0 12.01 3 M12 8 A4 4 0 1 0 12.01 8 M12 12 L12.01 12',
  },
  {
    id: 'pain',
    dx: -48,
    dy: -83,
    icon: 'M4 18 A9 9 0 0 1 20 18 M12 5 L12 10 M9 6 L10.5 10 M15 6 L13.5 10',
  },
  {
    id: 'guide',
    dx: 48,
    dy: 83,
    icon: 'M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z',
  },
  { id: 'settings', dx: -48, dy: 83, icon: 'M4 7 L20 7 M4 17 L20 17 M9 4 L9 10 M15 14 L15 20' },
]

export const HEX_WIDTH = 84
export const HEX_HEIGHT = 96

/** The focused cell swells, its neighbors shrink a little and the far ones more (fisheye). */
export const SCALE_FOCUSED = 1.2
export const SCALE_NEIGHBOR = 0.94
export const SCALE_FAR = 0.82
/** Cells closer than this to the focused one count as neighbors. */
export const NEIGHBOR_RADIUS = 100

export interface PlacedCell {
  readonly id: LauncherId
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly z: number
  readonly focused: boolean
}

const center = geometry.screenSize / 2

export function layoutFor(focusedIndex: number): PlacedCell[] {
  const focus = HEX_CELLS[focusedIndex] ?? HEX_CELLS[0]!
  return HEX_CELLS.map((cell) => {
    const focused = cell === focus
    const distance = Math.hypot(cell.dx - focus.dx, cell.dy - focus.dy)
    const scale = focused ? SCALE_FOCUSED : distance < NEIGHBOR_RADIUS ? SCALE_NEIGHBOR : SCALE_FAR
    return {
      id: cell.id,
      x: center + cell.dx,
      y: center + cell.dy,
      scale,
      z: focused ? 2 : 1,
      focused,
    }
  })
}

export type Direction = 'left' | 'right' | 'up' | 'down'

const VECTORS: Record<Direction, readonly [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
}

/**
 * Index of the cell an arrow key leads to: the nearest one that lies in that direction
 * (straighter wins over farther off-axis). Stays put at the edge; it does not wrap.
 */
export function moveFocus(fromIndex: number, direction: Direction): number {
  const from = HEX_CELLS[fromIndex]
  if (!from) return 0
  const [ux, uy] = VECTORS[direction]

  let best = fromIndex
  let bestScore = Infinity
  HEX_CELLS.forEach((cell, index) => {
    if (index === fromIndex) return
    const vx = cell.dx - from.dx
    const vy = cell.dy - from.dy
    const along = vx * ux + vy * uy
    if (along <= 0) return
    const across = Math.abs(vx * uy - vy * ux)
    const score = along + 0.6 * across
    if (score < bestScore) {
      best = index
      bestScore = score
    }
  })
  return best
}
