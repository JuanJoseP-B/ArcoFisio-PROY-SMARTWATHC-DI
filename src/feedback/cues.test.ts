import { describe, expect, it } from 'vitest'
import type { Zone } from '../domain/zones'
import {
  CLICK_CUE,
  CLICK_STEP_DEG,
  OVERSHOOT_REPEAT_MS,
  PULSE_FAST_MS,
  PULSE_SLOW_MS,
  ZONE_FEEDBACK,
} from './cues'

const ZONES: Zone[] = ['far', 'approach', 'near', 'target', 'overshoot', 'pain', 'rest']

describe('ZONE_FEEDBACK', () => {
  it('has an entry for every zone', () => {
    expect(Object.keys(ZONE_FEEDBACK).sort()).toEqual([...ZONES].sort())
  })

  it('keeps the spec timings: slow ~700 ms, fast ~300 ms', () => {
    expect(PULSE_SLOW_MS).toBe(700)
    expect(PULSE_FAST_MS).toBe(300)
    expect(ZONE_FEEDBACK.approach.repeatMs).toBe(PULSE_SLOW_MS)
    expect(ZONE_FEEDBACK.near.repeatMs).toBe(PULSE_FAST_MS)
    expect(CLICK_STEP_DEG).toBe(15)
  })

  it('is silent while far and at rest', () => {
    for (const zone of ['far', 'rest'] as const) {
      expect(ZONE_FEEDBACK[zone]).toEqual({ enter: null, repeat: null, repeatMs: null })
    }
  })

  it('plays the success chord once, with a double vibration', () => {
    expect(ZONE_FEEDBACK.target.enter).toEqual({ audio: 'success', vibration: [80, 60, 80] })
    expect(ZONE_FEEDBACK.target.repeat).toBeNull()
  })

  it('repeats the overshoot buzz with a short continuous vibration', () => {
    expect(ZONE_FEEDBACK.overshoot.repeatMs).toBe(OVERSHOOT_REPEAT_MS)
    expect(ZONE_FEEDBACK.overshoot.enter?.vibration).toEqual([200])
  })

  it('has a click without vibration for the far zone', () => {
    expect(CLICK_CUE).toEqual({ audio: 'click', vibration: null })
  })

  it('gives every sounding zone its own sound and its own vibration', () => {
    const sounding = ZONES.filter((zone) => ZONE_FEEDBACK[zone].enter !== null)
    const sounds = sounding.map((zone) => ZONE_FEEDBACK[zone].enter?.audio)
    const vibrations = sounding.map((zone) => JSON.stringify(ZONE_FEEDBACK[zone].enter?.vibration))
    expect(new Set(sounds).size).toBe(sounding.length)
    expect(new Set(vibrations).size).toBe(sounding.length)
  })

  it('repeats only the zones that have an interval, with the same cue', () => {
    for (const zone of ZONES) {
      const { repeat, repeatMs } = ZONE_FEEDBACK[zone]
      expect(repeat === null, zone).toBe(repeatMs === null)
    }
  })
})
