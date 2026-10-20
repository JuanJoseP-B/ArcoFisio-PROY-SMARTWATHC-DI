import { describe, expect, it, vi } from 'vitest'
import { createVibration } from './vibration'

describe('createVibration', () => {
  it('vibrates with a copy of the pattern', () => {
    const vibrate = vi.fn(() => true)
    const vibration = createVibration({ vibrate })
    const pattern = [80, 60, 80] as const

    expect(vibration.supported).toBe(true)
    expect(vibration.vibrate(pattern)).toBe(true)
    expect(vibrate).toHaveBeenCalledWith([80, 60, 80])
  })

  it('is a quiet no-op on devices without vibration, like iPhones', () => {
    const vibration = createVibration({})
    expect(vibration.supported).toBe(false)
    expect(vibration.vibrate([100])).toBe(false)
    expect(() => {
      vibration.cancel()
      vibration.setEnabled(false)
    }).not.toThrow()
  })

  it('does not vibrate while turned off, and stops a running vibration when turned off', () => {
    const vibrate = vi.fn(() => true)
    const vibration = createVibration({ vibrate })

    vibration.setEnabled(false)
    expect(vibrate).toHaveBeenLastCalledWith(0)
    vibrate.mockClear()

    expect(vibration.vibrate([100])).toBe(false)
    expect(vibrate).not.toHaveBeenCalled()

    vibration.setEnabled(true)
    expect(vibration.vibrate([100])).toBe(true)
  })

  it('cancels with a zero-length vibration', () => {
    const vibrate = vi.fn(() => true)
    createVibration({ vibrate }).cancel()
    expect(vibrate).toHaveBeenCalledWith(0)
  })

  it('survives a browser that throws or refuses', () => {
    const throwing = createVibration({
      vibrate: () => {
        throw new Error('not allowed')
      },
    })
    expect(throwing.vibrate([50])).toBe(false)
    expect(() => throwing.cancel()).not.toThrow()

    expect(createVibration({ vibrate: () => false }).vibrate([50])).toBe(false)
  })
})
