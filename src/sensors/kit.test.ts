import { describe, expect, it } from 'vitest'
import { createCalibrationRepo } from '../data/calibrationRepo'
import { createStorage } from '../data/storage'
import { FakeStorage } from '../data/testStorage'
import { createSensorKit, isSimRequested } from './kit'

const newStore = () => createCalibrationRepo(createStorage(new FakeStorage()))

describe('isSimRequested', () => {
  it.each([
    ['?sim=1', true],
    ['?foo=2&sim=1', true],
    ['?sim=0', false],
    ['?sim=true', false],
    ['', false],
  ])('%s -> %s', (search, expected) => {
    expect(isSimRequested(search)).toBe(expected)
  })
})

describe('createSensorKit', () => {
  it('builds a calibrated simulator that reads the angle immediately', () => {
    const kit = createSensorKit('sim', newStore())
    expect(kit.mode).toBe('sim')
    expect(kit.simulated).not.toBeNull()

    kit.simulated?.setAngle(80)
    kit.tracker.start()
    expect(kit.tracker.getSnapshot().status).toBe('live')
    expect(kit.tracker.getSnapshot().angle).toBeCloseTo(80, 6)
  })

  it('builds a device kit that needs calibration before it can read', () => {
    const kit = createSensorKit('device', newStore())
    expect(kit.mode).toBe('device')
    expect(kit.simulated).toBeNull()
    expect(kit.tracker.mode).toBe('device')
  })

  it('restores a saved device calibration', () => {
    const store = newStore()
    store.save({
      gravityRef: [0, 0, 1],
      calibratedAt: '2026-01-01T00:00:00.000Z',
      sensorMode: 'device',
    })
    const kit = createSensorKit('device', store)
    kit.tracker.start()
    window.dispatchEvent(
      Object.assign(new Event('devicemotion'), {
        accelerationIncludingGravity: { x: 0, y: 9.81, z: 0 },
      }),
    )
    expect(kit.tracker.getSnapshot().angle).toBeCloseTo(90, 6)
  })
})
