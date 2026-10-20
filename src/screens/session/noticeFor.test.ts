import { describe, expect, it } from 'vitest'
import type { TrackerStatus } from '../../sensors/tracker'
import { noticeFor } from './noticeFor'

describe('noticeFor', () => {
  it('has nothing to say while the sensor is live', () => {
    expect(noticeFor('live')).toBeNull()
  })

  it('offers to enable the sensor when no data arrives (iOS asks inside a tap)', () => {
    expect(noticeFor('no-data')).toEqual({
      message: 'sensor.noData',
      action: 'enable',
      simHint: false,
    })
  })

  it('offers the arm-down calibration when there is no reference yet', () => {
    expect(noticeFor('uncalibrated')).toMatchObject({
      message: 'sensor.uncalibrated',
      action: 'calibrate',
    })
  })

  it('suggests the simulator when access is denied or the device has no sensor', () => {
    expect(noticeFor('denied')).toMatchObject({ message: 'sensor.denied', simHint: true })
    expect(noticeFor('unsupported')).toMatchObject({ message: 'sensor.unsupported', simHint: true })
  })

  it('says it is waiting or paused otherwise', () => {
    expect(noticeFor('paused')?.message).toBe('sensor.paused')
    for (const status of ['idle', 'waiting'] as TrackerStatus[]) {
      expect(noticeFor(status)).toEqual({ message: 'sensor.waiting', action: null, simHint: false })
    }
  })
})
