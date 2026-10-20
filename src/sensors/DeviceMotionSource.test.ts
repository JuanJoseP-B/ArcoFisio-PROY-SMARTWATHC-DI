import { describe, expect, it, vi } from 'vitest'
import { DeviceMotionSource, readGravity } from './DeviceMotionSource'
import type { MotionTarget } from './DeviceMotionSource'

type Handler = Parameters<MotionTarget['addEventListener']>[1]

class FakeTarget implements MotionTarget {
  readonly handlers = new Set<Handler>()
  addEventListener(_type: 'devicemotion', listener: Handler): void {
    this.handlers.add(listener)
  }
  removeEventListener(_type: 'devicemotion', listener: Handler): void {
    this.handlers.delete(listener)
  }
  emit(x: number | null, y: number | null, z: number | null): void {
    for (const handler of this.handlers) handler({ accelerationIncludingGravity: { x, y, z } })
  }
}

describe('readGravity', () => {
  it('returns the vector when all axes are numbers', () => {
    expect(readGravity({ accelerationIncludingGravity: { x: 1, y: 2, z: 3 } })).toEqual([1, 2, 3])
  })

  it('returns null when the reading is missing or partial', () => {
    expect(readGravity({})).toBeNull()
    expect(readGravity({ accelerationIncludingGravity: null })).toBeNull()
    expect(readGravity({ accelerationIncludingGravity: { x: 1, y: null, z: 3 } })).toBeNull()
    expect(readGravity({ accelerationIncludingGravity: { x: NaN, y: 0, z: 0 } })).toBeNull()
  })
})

describe('DeviceMotionSource', () => {
  it('delivers samples to listeners only while started', () => {
    const target = new FakeTarget()
    const source = new DeviceMotionSource({ target })
    const listener = vi.fn()
    source.onSample(listener)

    target.emit(0, 0, 9.81)
    expect(listener).not.toHaveBeenCalled()

    source.start()
    target.emit(0, 0, 9.81)
    expect(listener).toHaveBeenCalledWith([0, 0, 9.81])

    source.stop()
    target.emit(1, 1, 1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('registers a single DOM listener however often start is called', () => {
    const target = new FakeTarget()
    const source = new DeviceMotionSource({ target })
    source.start()
    source.start()
    expect(target.handlers.size).toBe(1)
    source.stop()
    source.stop()
    expect(target.handlers.size).toBe(0)
  })

  it('stops delivering after unsubscribe', () => {
    const target = new FakeTarget()
    const source = new DeviceMotionSource({ target })
    const listener = vi.fn()
    const unsubscribe = source.onSample(listener)
    source.start()
    unsubscribe()
    target.emit(0, 0, 9.81)
    expect(listener).not.toHaveBeenCalled()
  })

  it('ignores events without a usable reading', () => {
    const target = new FakeTarget()
    const source = new DeviceMotionSource({ target })
    const listener = vi.fn()
    source.onSample(listener)
    source.start()
    target.emit(null, null, null)
    expect(listener).not.toHaveBeenCalled()
  })

  it('reports device mode and delegates the permission request', async () => {
    const source = new DeviceMotionSource({
      target: new FakeTarget(),
      env: { isSecureContext: false },
    })
    expect(source.mode).toBe('device')
    expect(await source.requestPermission()).toBe('unsupported')
  })
})
