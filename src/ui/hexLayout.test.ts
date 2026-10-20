import { describe, expect, it } from 'vitest'
import {
  HEX_CELLS,
  HEX_HEIGHT,
  HEX_WIDTH,
  NEIGHBOR_RADIUS,
  SCALE_FAR,
  SCALE_FOCUSED,
  SCALE_NEIGHBOR,
  layoutFor,
  moveFocus,
} from './hexLayout'
import type { LauncherId } from './hexLayout'

const index = (id: LauncherId) => HEX_CELLS.findIndex((cell) => cell.id === id)
const idAt = (i: number) => HEX_CELLS[i]?.id

describe('HEX_CELLS', () => {
  it('holds the seven apps in spec order', () => {
    expect(HEX_CELLS.map((cell) => cell.id)).toEqual([
      'measure',
      'session',
      'routines',
      'summary',
      'pain',
      'guide',
      'settings',
    ])
  })

  it('places them on the sheet honeycomb around the center', () => {
    const at = (id: LauncherId) => {
      const cell = HEX_CELLS[index(id)]!
      return [cell.dx, cell.dy]
    }
    expect(at('measure')).toEqual([0, 0])
    expect(at('session')).toEqual([96, 0])
    expect(at('routines')).toEqual([-96, 0])
    expect(at('summary')).toEqual([48, -83])
    expect(at('pain')).toEqual([-48, -83])
    expect(at('guide')).toEqual([48, 83])
    expect(at('settings')).toEqual([-48, 83])
    expect([HEX_WIDTH, HEX_HEIGHT]).toEqual([84, 96])
  })

  it('keeps every cell, scaled up when focused, inside the 328 px safe circle', () => {
    for (const cell of HEX_CELLS) {
      const reach = Math.hypot(
        Math.abs(cell.dx) + (HEX_WIDTH / 2) * SCALE_FOCUSED,
        Math.abs(cell.dy) + (HEX_HEIGHT / 2) * 0.75 * SCALE_FOCUSED,
      )
      expect(reach, cell.id).toBeLessThan(164 + 20)
    }
  })
})

describe('layoutFor', () => {
  it('swells the focused cell, shrinks the neighbors and shrinks the far ones more', () => {
    const placed = layoutFor(index('measure'))
    const scale = (id: LauncherId) => placed.find((cell) => cell.id === id)?.scale
    expect(scale('measure')).toBe(1.2)
    for (const id of ['session', 'routines', 'summary', 'pain', 'guide', 'settings'] as const) {
      expect(scale(id), id).toBe(SCALE_NEIGHBOR)
    }
  })

  it('treats the cells across the honeycomb as far from an edge cell', () => {
    const placed = layoutFor(index('session'))
    const scale = (id: LauncherId) => placed.find((cell) => cell.id === id)?.scale
    expect(scale('session')).toBe(SCALE_FOCUSED)
    expect(scale('measure')).toBe(SCALE_NEIGHBOR)
    expect(scale('summary')).toBe(SCALE_NEIGHBOR)
    expect(scale('guide')).toBe(SCALE_NEIGHBOR)
    expect(scale('routines')).toBe(SCALE_FAR)
    expect(scale('pain')).toBe(SCALE_FAR)
    expect(scale('settings')).toBe(SCALE_FAR)
    expect(NEIGHBOR_RADIUS).toBe(100)
  })

  it('puts the focused cell on top and gives screen coordinates', () => {
    const placed = layoutFor(index('guide'))
    const focused = placed.find((cell) => cell.focused)!
    expect(focused.id).toBe('guide')
    expect(focused.z).toBe(2)
    expect(focused.x).toBe(192 + 48)
    expect(focused.y).toBe(192 + 83)
    expect(placed.filter((cell) => cell.z === 1)).toHaveLength(6)
  })

  it('falls back to the first cell for an invalid index', () => {
    expect(layoutFor(99).find((cell) => cell.focused)?.id).toBe('measure')
  })
})

describe('moveFocus', () => {
  it('moves along the middle row', () => {
    expect(idAt(moveFocus(index('measure'), 'right'))).toBe('session')
    expect(idAt(moveFocus(index('measure'), 'left'))).toBe('routines')
    expect(idAt(moveFocus(index('routines'), 'right'))).toBe('measure')
  })

  it('moves up and down the honeycomb', () => {
    expect(idAt(moveFocus(index('session'), 'up'))).toBe('summary')
    expect(idAt(moveFocus(index('routines'), 'up'))).toBe('pain')
    expect(idAt(moveFocus(index('session'), 'down'))).toBe('guide')
    expect(idAt(moveFocus(index('routines'), 'down'))).toBe('settings')
    expect(idAt(moveFocus(index('summary'), 'down'))).toBe('measure')
  })

  it('moves along the top and bottom rows', () => {
    expect(idAt(moveFocus(index('summary'), 'left'))).toBe('pain')
    expect(idAt(moveFocus(index('pain'), 'right'))).toBe('summary')
    expect(idAt(moveFocus(index('guide'), 'left'))).toBe('settings')
  })

  it('stays put at the edges instead of wrapping', () => {
    expect(moveFocus(index('session'), 'right')).toBe(index('session'))
    expect(moveFocus(index('routines'), 'left')).toBe(index('routines'))
    expect(moveFocus(index('summary'), 'up')).toBe(index('summary'))
    expect(moveFocus(index('settings'), 'down')).toBe(index('settings'))
  })

  it('reaches every cell from the center with arrow keys', () => {
    const reached = new Set<number>([index('measure')])
    const queue = [index('measure')]
    while (queue.length) {
      const at = queue.shift()!
      for (const direction of ['left', 'right', 'up', 'down'] as const) {
        const next = moveFocus(at, direction)
        if (!reached.has(next)) {
          reached.add(next)
          queue.push(next)
        }
      }
    }
    expect(reached.size).toBe(HEX_CELLS.length)
  })

  it('returns the first cell for an invalid start', () => {
    expect(moveFocus(42, 'right')).toBe(0)
  })
})
