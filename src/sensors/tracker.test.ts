import { afterEach, describe, expect, it, vi } from 'vitest'
import { NO_DATA_TIMEOUT_MS } from './constants'
import { SimulatedSource, gravityForAngle } from './SimulatedSource'
import { createAngleTracker } from './tracker'
import type { AngleSource, PermissionResult, SampleListener, Vec3 } from './types'

const hanging = { gravityRef: gravityForAngle(0) }

afterEach(() => {
  vi.useRealTimers()
})

/** Feeds the same angle until the exponential filter has converged. */
function settle(source: SimulatedSource, angle: number): void {
  for (let i = 0; i < 80; i += 1) source.setAngle(angle)
}

/** A source whose lifecycle does nothing, so the test decides when samples arrive. */
function silentSource(permission: PermissionResult = 'granted') {
  const listeners = new Set<SampleListener>()
  const source: AngleSource = {
    mode: 'device',
    start: () => {},
    stop: () => {},
    onSample: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    requestPermission: () => Promise.resolve(permission),
  }
  return {
    source,
    emit: (sample: Vec3) => {
      for (const listener of listeners) listener(sample)
    },
  }
}

function setup(calibrated = true) {
  const source = new SimulatedSource()
  const tracker = createAngleTracker(source)
  if (calibrated) tracker.setCalibration(hanging)
  return { source, tracker }
}

describe('createAngleTracker', () => {
  it('starts idle with no angle', () => {
    expect(setup().tracker.getSnapshot()).toEqual({ angle: null, status: 'idle' })
  })

  it('goes live and follows the simulated arm', () => {
    const { source, tracker } = setup()
    tracker.start()
    settle(source, 90)
    expect(tracker.getSnapshot().status).toBe('live')
    expect(tracker.getSnapshot().angle).toBeCloseTo(90, 0)
  })

  it('reports the first sample unfiltered', () => {
    const { source, tracker } = setup()
    source.setAngle(60)
    tracker.start()
    expect(tracker.getSnapshot().angle).toBeCloseTo(60, 6)
  })

  it('reports uncalibrated while samples arrive without a reference', () => {
    const { source, tracker } = setup(false)
    tracker.start()
    source.setAngle(30)
    expect(tracker.getSnapshot()).toEqual({ angle: null, status: 'uncalibrated' })
  })

  it('waits for the first sample after start', () => {
    const { source } = silentSource()
    const tracker = createAngleTracker(source)
    tracker.start()
    expect(tracker.getSnapshot().status).toBe('waiting')
  })

  it('smooths movement with the exponential filter', () => {
    const { source, tracker } = setup()
    tracker.start()
    source.setAngle(40)
    const angle = tracker.getSnapshot().angle ?? NaN
    expect(angle).toBeGreaterThan(0)
    expect(angle).toBeLessThan(40)
  })

  it('keeps the snapshot reference stable when nothing changed', () => {
    const { source, tracker } = setup()
    tracker.start()
    settle(source, 20)
    const first = tracker.getSnapshot()
    source.setAngle(20)
    expect(tracker.getSnapshot()).toBe(first)
  })

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const { source, tracker } = setup()
    const listener = vi.fn()
    const unsubscribe = tracker.subscribe(listener)
    tracker.start()
    expect(listener).toHaveBeenCalled()
    const calls = listener.mock.calls.length
    unsubscribe()
    source.setAngle(60)
    expect(listener).toHaveBeenCalledTimes(calls)
  })

  it('pauses without sampling and resumes from a clean state', () => {
    const { source, tracker } = setup()
    tracker.start()
    settle(source, 50)
    tracker.pause()
    expect(tracker.getSnapshot().status).toBe('paused')
    source.setAngle(120)
    expect(tracker.getSnapshot().angle).toBeCloseTo(50, 0)

    tracker.resume()
    expect(tracker.getSnapshot().status).toBe('live')
    expect(tracker.getSnapshot().angle).toBeCloseTo(120, 6)
  })

  it('ignores pause when idle and resume when not paused', () => {
    const { tracker } = setup()
    tracker.pause()
    tracker.resume()
    expect(tracker.getSnapshot().status).toBe('idle')
  })

  it('stop returns to idle and clears the angle', () => {
    const { source, tracker } = setup()
    tracker.start()
    source.setAngle(70)
    tracker.stop()
    expect(tracker.getSnapshot()).toEqual({ angle: null, status: 'idle' })
  })

  it('ignores samples that arrive while stopped', () => {
    const { source, emit } = silentSource()
    const tracker = createAngleTracker(source)
    tracker.setCalibration(hanging)
    emit(gravityForAngle(45))
    expect(tracker.getSnapshot().status).toBe('idle')
  })

  it('flags no-data when the sensor stays silent', () => {
    vi.useFakeTimers()
    const { source } = silentSource()
    const tracker = createAngleTracker(source)
    tracker.start()
    vi.advanceTimersByTime(NO_DATA_TIMEOUT_MS)
    expect(tracker.getSnapshot().status).toBe('no-data')
  })

  it('recovers from no-data when a sample finally arrives', () => {
    vi.useFakeTimers()
    const { source, emit } = silentSource()
    const tracker = createAngleTracker(source)
    tracker.setCalibration(hanging)
    tracker.start()
    vi.advanceTimersByTime(NO_DATA_TIMEOUT_MS)
    emit(gravityForAngle(10))
    expect(tracker.getSnapshot().status).toBe('live')
  })

  it.each<PermissionResult>(['denied', 'unsupported'])('blocks start after %s', async (result) => {
    const { source } = silentSource(result)
    const tracker = createAngleTracker(source)
    expect(await tracker.requestPermission()).toBe(result)
    tracker.start()
    expect(tracker.getSnapshot().status).toBe(result)
    expect((await tracker.calibrate()).ok).toBe(false)
  })

  it('clears a previous refusal once permission is granted', async () => {
    let answer: PermissionResult = 'denied'
    const { source } = silentSource()
    const tracker = createAngleTracker({
      ...source,
      requestPermission: () => Promise.resolve(answer),
    })
    await tracker.requestPermission()
    expect(tracker.getSnapshot().status).toBe('denied')

    answer = 'granted'
    expect(await tracker.requestPermission()).toBe('granted')
    expect(tracker.getSnapshot().status).toBe('idle')
  })

  it('calibrates at the current pose and then reads 0 there', async () => {
    const { source, tracker } = setup(false)
    const pending = tracker.calibrate({ minSamples: 3 })
    for (let i = 0; i < 3; i += 1) source.setAngle(0)
    expect((await pending).ok).toBe(true)
    expect(tracker.getSnapshot().status).toBe('live')
    expect(tracker.getSnapshot().angle).toBeCloseTo(0, 6)

    settle(source, 90)
    expect(tracker.getSnapshot().angle).toBeCloseTo(90, 0)
  })

  it('keeps the previous calibration when a new one fails', async () => {
    vi.useFakeTimers()
    const { source, tracker } = setup()
    tracker.start()
    const pending = tracker.calibrate({ minSamples: 50, timeoutMs: 100 })
    vi.advanceTimersByTime(100)
    expect((await pending).ok).toBe(false)
    settle(source, 90)
    expect(tracker.getSnapshot().angle).toBeCloseTo(90, 0)
  })
})
