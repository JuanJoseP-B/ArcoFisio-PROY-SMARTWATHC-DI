import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCalibrationRepo } from './calibrationRepo'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'
import type { Calibration } from './types'

const calibration: Calibration = {
  gravityRef: [0.01, -0.02, 0.9998],
  calibratedAt: '2026-10-19T10:00:00.000Z',
  sensorMode: 'device',
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

describe('calibration repository', () => {
  it('is empty until a calibration is saved', () => {
    expect(createCalibrationRepo(createStorage(new FakeStorage())).get()).toBeNull()
  })

  it('keeps the calibration across reloads', () => {
    const backend = new FakeStorage()
    expect(createCalibrationRepo(createStorage(backend)).save(calibration)).toBe(true)
    expect(createCalibrationRepo(createStorage(backend)).get()).toEqual(calibration)
  })

  it('rejects an invalid calibration without touching the stored one', () => {
    const repo = createCalibrationRepo(createStorage(new FakeStorage()))
    repo.save(calibration)
    expect(repo.save({ ...calibration, gravityRef: [0, 0, 0] })).toBe(false)
    expect(repo.get()).toEqual(calibration)
  })

  it('clears the calibration', () => {
    const repo = createCalibrationRepo(createStorage(new FakeStorage()))
    repo.save(calibration)
    repo.clear()
    expect(repo.get()).toBeNull()
  })

  it('discards a corrupt calibration', () => {
    const backend = new FakeStorage()
    backend.seed('arcofisio:v1:calibration', '{"schema":1,"data":{"gravityRef":"x"}}')
    expect(createCalibrationRepo(createStorage(backend)).get()).toBeNull()
  })
})
