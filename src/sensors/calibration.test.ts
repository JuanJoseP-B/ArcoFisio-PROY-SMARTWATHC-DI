import { afterEach, describe, expect, it, vi } from 'vitest'
import { computeAngle } from '../domain/angle'
import { averageGravity, calibrate, collectSamples, toCalibration } from './calibration'
import { SimulatedSource, gravityForAngle } from './SimulatedSource'
import type { Vec3 } from './types'

const repeat = (sample: Vec3, times: number): Vec3[] => Array.from({ length: times }, () => sample)

afterEach(() => {
  vi.useRealTimers()
})

describe('averageGravity', () => {
  it('returns the normalized direction of steady samples', () => {
    const result = averageGravity(repeat([0, 0, 9.81], 30), 20, 4)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.gravityRef[0]).toBeCloseTo(0, 9)
      expect(result.gravityRef[2]).toBeCloseTo(1, 9)
    }
  })

  it('averages out small noise so the reference reads 0 degrees afterwards', () => {
    const noisy: Vec3[] = Array.from({ length: 40 }, (_, i) => {
      const jitter = (i % 2 === 0 ? 1 : -1) * 0.02
      return [jitter, -jitter, 9.81]
    })
    const result = averageGravity(noisy, 20, 4)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(computeAngle([0, 0, 9.81], result)).toBeLessThan(0.2)
    }
  })

  it('fails with no-data below the minimum sample count', () => {
    expect(averageGravity(repeat([0, 0, 9.81], 5), 20, 4)).toEqual({ ok: false, reason: 'no-data' })
  })

  it('ignores zero vectors when counting samples', () => {
    const samples = [...repeat([0, 0, 0], 30), ...repeat([0, 0, 9.81], 5)]
    expect(averageGravity(samples, 20, 4)).toEqual({ ok: false, reason: 'no-data' })
  })

  it('fails with unstable when the arm moves during the reading', () => {
    const samples = [...repeat(gravityForAngle(0), 20), ...repeat(gravityForAngle(30), 20)]
    expect(averageGravity(samples, 20, 4)).toEqual({ ok: false, reason: 'unstable' })
  })

  it('fails with unstable when opposite vectors cancel out', () => {
    const samples = [...repeat([0, 0, 9.81], 10), ...repeat([0, 0, -9.81], 10)]
    expect(averageGravity(samples, 20, 4)).toEqual({ ok: false, reason: 'unstable' })
  })
})

describe('collectSamples', () => {
  it('resolves as soon as the requested count arrives', async () => {
    const source = new SimulatedSource()
    const pending = collectSamples(source, 3, 1000)
    source.start()
    source.setAngle(1)
    source.setAngle(2)
    expect(await pending).toHaveLength(3)
  })

  it('resolves with what it has when the timeout fires', async () => {
    vi.useFakeTimers()
    const source = new SimulatedSource()
    const pending = collectSamples(source, 10, 500)
    source.start()
    vi.advanceTimersByTime(500)
    expect(await pending).toHaveLength(1)
  })

  it('stops listening once finished', async () => {
    vi.useFakeTimers()
    const source = new SimulatedSource()
    const pending = collectSamples(source, 10, 100)
    vi.advanceTimersByTime(100)
    const samples = await pending
    source.start()
    source.setAngle(5)
    expect(samples).toHaveLength(0)
  })
})

describe('calibrate', () => {
  it('calibrates a steady simulated arm to a 0 degree reference', async () => {
    const source = new SimulatedSource()
    const pending = calibrate(source, { minSamples: 5 })
    source.start()
    for (let i = 0; i < 4; i += 1) source.setAngle(0)
    const result = await pending
    expect(result.ok).toBe(true)
    if (result.ok) expect(computeAngle(gravityForAngle(90), result)).toBeCloseTo(90, 6)
  })

  it('reports no-data when the sensor never emits', async () => {
    vi.useFakeTimers()
    const source = new SimulatedSource()
    const pending = calibrate(source, { timeoutMs: 200 })
    vi.advanceTimersByTime(200)
    expect(await pending).toEqual({ ok: false, reason: 'no-data' })
  })
})

describe('toCalibration', () => {
  it('builds the persisted shape', () => {
    const now = new Date('2026-01-02T03:04:05.000Z')
    expect(toCalibration([0, 0, 1], 'device', now)).toEqual({
      gravityRef: [0, 0, 1],
      calibratedAt: '2026-01-02T03:04:05.000Z',
      sensorMode: 'device',
    })
  })
})
