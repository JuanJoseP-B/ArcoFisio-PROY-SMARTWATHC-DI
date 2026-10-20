import { describe, expect, it } from 'vitest'
import { createCalibrationRepo } from '../data/calibrationRepo'
import { createStorage } from '../data/storage'
import { FakeStorage } from '../data/testStorage'
import { calibrateAndSave, restoreCalibration } from './calibrationFlow'
import { SimulatedSource } from './SimulatedSource'
import { createAngleTracker } from './tracker'

function setup() {
  const repo = createCalibrationRepo(createStorage(new FakeStorage()))
  const source = new SimulatedSource()
  const tracker = createAngleTracker(source)
  return { repo, source, tracker }
}

describe('calibrateAndSave', () => {
  it('persists the reference with the tracker mode when calibration succeeds', async () => {
    const { repo, source, tracker } = setup()
    const pending = calibrateAndSave(tracker, repo, { minSamples: 3 })
    for (let i = 0; i < 3; i += 1) source.setAngle(0)

    expect((await pending).ok).toBe(true)
    const saved = repo.get()
    expect(saved?.sensorMode).toBe('sim')
    expect(saved?.gravityRef[2]).toBeCloseTo(1, 6)
  })

  it('saves nothing when calibration fails', async () => {
    const { repo, tracker } = setup()
    const result = await calibrateAndSave(tracker, repo, { minSamples: 5, timeoutMs: 10 })
    expect(result.ok).toBe(false)
    expect(repo.get()).toBeNull()
  })
})

describe('restoreCalibration', () => {
  it('returns false when nothing is saved', () => {
    const { repo, tracker } = setup()
    expect(restoreCalibration(tracker, repo)).toBe(false)
    expect(tracker.getSnapshot().status).toBe('idle')
  })

  it('restores a saved reference so the angle reads right after reload', async () => {
    const first = setup()
    const pending = calibrateAndSave(first.tracker, first.repo, { minSamples: 3 })
    for (let i = 0; i < 3; i += 1) first.source.setAngle(0)
    await pending

    const source = new SimulatedSource()
    const tracker = createAngleTracker(source)
    expect(restoreCalibration(tracker, first.repo)).toBe(true)
    source.setAngle(75)
    tracker.start()
    expect(tracker.getSnapshot().angle).toBeCloseTo(75, 6)
  })

  it('ignores a reference taken with a different kind of sensor', () => {
    const { repo, tracker } = setup()
    repo.save({
      gravityRef: [0, 0, 1],
      calibratedAt: '2026-01-01T00:00:00.000Z',
      sensorMode: 'device',
    })
    expect(restoreCalibration(tracker, repo)).toBe(false)
  })
})
