import { describe, expect, it } from 'vitest'
import { SWIPE_MAX_MS, isSwipeBack } from './swipe'

const at = (x: number, y: number, t: number) => ({ x, y, t })
const WIDTH = 384

describe('isSwipeBack', () => {
  it('accepts a quick left-to-right swipe', () => {
    expect(isSwipeBack(at(100, 200, 0), at(200, 210, 250), WIDTH)).toBe(true)
  })

  it('needs about a fifth of the screen width', () => {
    expect(isSwipeBack(at(100, 200, 0), at(160, 200, 200), WIDTH)).toBe(false)
    expect(isSwipeBack(at(100, 200, 0), at(100 + WIDTH * 0.18, 200, 200), WIDTH)).toBe(true)
  })

  it('scales the distance with the on-screen size of the watch', () => {
    expect(isSwipeBack(at(0, 0, 0), at(40, 0, 100), 200)).toBe(true)
    expect(isSwipeBack(at(0, 0, 0), at(40, 0, 100), 384)).toBe(false)
  })

  it('rejects right-to-left swipes', () => {
    expect(isSwipeBack(at(300, 200, 0), at(150, 200, 200), WIDTH)).toBe(false)
  })

  it('rejects mostly vertical drags', () => {
    expect(isSwipeBack(at(100, 100, 0), at(180, 260, 200), WIDTH)).toBe(false)
  })

  it('rejects slow drags', () => {
    expect(isSwipeBack(at(100, 200, 0), at(220, 200, SWIPE_MAX_MS + 1), WIDTH)).toBe(false)
    expect(isSwipeBack(at(100, 200, 0), at(220, 200, SWIPE_MAX_MS), WIDTH)).toBe(true)
  })

  it('rejects a tap', () => {
    expect(isSwipeBack(at(100, 200, 0), at(100, 200, 60), WIDTH)).toBe(false)
  })
})
