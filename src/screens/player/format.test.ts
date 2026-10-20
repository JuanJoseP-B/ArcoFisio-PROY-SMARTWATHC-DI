import { describe, expect, it } from 'vitest'
import { formatClock, pillWidth } from './format'

describe('player format', () => {
  it('reads seconds as minutes and seconds', () => {
    expect(formatClock(30)).toBe('0:30')
    expect(formatClock(5)).toBe('0:05')
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(125)).toBe('2:05')
    expect(formatClock(600)).toBe('10:00')
  })

  it('never reads below zero or in fractions', () => {
    expect(formatClock(-4)).toBe('0:00')
    expect(formatClock(29.9)).toBe('0:29')
  })

  it('keeps the set pills at the sheet width while they fit and shrinks them after', () => {
    expect(pillWidth(1)).toBe(28)
    expect(pillWidth(3)).toBe(28)
    expect(pillWidth(8)).toBe(14)
    expect(pillWidth(20)).toBe(4)
  })

  it('never makes a pill wider than the sheet or thinner than 4 px', () => {
    for (let sets = 1; sets <= 20; sets += 1) {
      expect(pillWidth(sets)).toBeGreaterThanOrEqual(4)
      expect(pillWidth(sets)).toBeLessThanOrEqual(28)
    }
  })
})
