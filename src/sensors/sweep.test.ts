import { describe, expect, it } from 'vitest'
import { startSweep, triangleAngle } from './sweep'
import type { FrameScheduler } from './sweep'

class ManualScheduler implements FrameScheduler {
  private next = 1
  private readonly pending = new Map<number, (time: number) => void>()

  request(callback: (time: number) => void): number {
    const handle = this.next++
    this.pending.set(handle, callback)
    return handle
  }

  cancel(handle: number): void {
    this.pending.delete(handle)
  }

  get size(): number {
    return this.pending.size
  }

  tick(time: number): void {
    const callbacks = [...this.pending.values()]
    this.pending.clear()
    for (const callback of callbacks) callback(time)
  }
}

describe('triangleAngle', () => {
  it('rises to max at half period and returns to min', () => {
    expect(triangleAngle(0, 0, 150, 1000)).toBe(0)
    expect(triangleAngle(250, 0, 150, 1000)).toBeCloseTo(75, 6)
    expect(triangleAngle(500, 0, 150, 1000)).toBeCloseTo(150, 6)
    expect(triangleAngle(750, 0, 150, 1000)).toBeCloseTo(75, 6)
    expect(triangleAngle(1000, 0, 150, 1000)).toBeCloseTo(0, 6)
  })

  it('repeats every period', () => {
    expect(triangleAngle(1250, 0, 150, 1000)).toBeCloseTo(75, 6)
  })
})

describe('startSweep', () => {
  it('feeds the sink each frame relative to the first frame', () => {
    const scheduler = new ManualScheduler()
    const angles: number[] = []
    startSweep({ setAngle: (a) => angles.push(a) }, { max: 100, periodMs: 1000, scheduler })

    scheduler.tick(5000)
    scheduler.tick(5500)
    expect(angles[0]).toBe(0)
    expect(angles[1]).toBeCloseTo(100, 6)
  })

  it('stops requesting frames after the stop function runs', () => {
    const scheduler = new ManualScheduler()
    const angles: number[] = []
    const stop = startSweep({ setAngle: (a) => angles.push(a) }, { scheduler })

    scheduler.tick(0)
    stop()
    expect(scheduler.size).toBe(0)
    scheduler.tick(100)
    expect(angles).toHaveLength(1)
  })
})
