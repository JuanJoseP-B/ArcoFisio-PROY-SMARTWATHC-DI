import { describe, expect, it } from 'vitest'
import { dot, normalize, norm } from './vector'

describe('vector helpers', () => {
  it('computes dot product and norm', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
    expect(norm([3, 4, 0])).toBe(5)
  })

  it('normalizes to unit length', () => {
    const unit = normalize([0, 0, 9.81])
    expect(unit).toEqual([0, 0, 1])
    expect(norm(normalize([3, 4, 12]) ?? [0, 0, 0])).toBeCloseTo(1, 12)
  })

  it('rejects zero, tiny and non-finite vectors', () => {
    expect(normalize([0, 0, 0])).toBeNull()
    expect(normalize([1e-9, 0, 0])).toBeNull()
    expect(normalize([Number.NaN, 1, 0])).toBeNull()
    expect(normalize([Number.POSITIVE_INFINITY, 0, 0])).toBeNull()
  })
})
