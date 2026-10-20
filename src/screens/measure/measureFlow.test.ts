import { describe, expect, it } from 'vitest'
import type { TrackerStatus } from '../../sensors/tracker'
import { failureMessage, messageFor, stepFor, suggestsSimulator, trackMax } from './measureFlow'

describe('stepFor', () => {
  it('asks for access until the sensor answers', () => {
    for (const status of ['idle', 'waiting', 'no-data', 'paused'] as TrackerStatus[]) {
      expect(stepFor(status)).toBe('enable')
    }
  })

  it('asks for the arm-down reading once samples arrive without a reference', () => {
    expect(stepFor('uncalibrated')).toBe('calibrate')
  })

  it('blocks when access is refused or there is no sensor', () => {
    expect(stepFor('denied')).toBe('blocked')
    expect(stepFor('unsupported')).toBe('blocked')
  })

  it('is ready to measure once the angle is live', () => {
    expect(stepFor('live')).toBe('range')
  })
})

describe('messageFor', () => {
  it('has a message for each state the person can be stuck in', () => {
    expect(messageFor('idle')).toBe('measure.enable')
    expect(messageFor('waiting')).toBe('measure.enable')
    expect(messageFor('no-data')).toBe('sensor.noData')
    expect(messageFor('uncalibrated')).toBe('measure.calibrate')
    expect(messageFor('denied')).toBe('sensor.denied')
    expect(messageFor('unsupported')).toBe('sensor.unsupported')
  })
})

describe('suggestsSimulator', () => {
  it('only when the real sensor gives nothing usable', () => {
    expect(suggestsSimulator('denied')).toBe(true)
    expect(suggestsSimulator('unsupported')).toBe(true)
    expect(suggestsSimulator('no-data')).toBe(true)
    expect(suggestsSimulator('uncalibrated')).toBe(false)
    expect(suggestsSimulator('live')).toBe(false)
    expect(suggestsSimulator('waiting')).toBe(false)
  })
})

describe('failureMessage', () => {
  it('tells apart moving from not hearing the sensor', () => {
    expect(failureMessage('unstable')).toBe('measure.unstable')
    expect(failureMessage('no-data')).toBe('measure.noReading')
  })
})

describe('trackMax', () => {
  it('keeps the largest angle seen', () => {
    expect(trackMax(null, 40)).toBe(40)
    expect(trackMax(40, 95)).toBe(95)
    expect(trackMax(95, 60)).toBe(95)
  })

  it('does not lose the max when a reading is missing', () => {
    expect(trackMax(95, null)).toBe(95)
    expect(trackMax(null, null)).toBeNull()
  })

  it('accepts 0 as a first reading', () => {
    expect(trackMax(null, 0)).toBe(0)
  })
})
