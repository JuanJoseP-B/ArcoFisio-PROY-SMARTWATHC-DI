import { describe, expect, it } from 'vitest'
import type { Zone } from '../domain/zones'
import { CLICK_CUE, SUCCESS_COOLDOWN_MS, ZONE_FEEDBACK } from './cues'
import type { Cue } from './cues'
import { initialFeedbackState, stepFeedback } from './stepFeedback'
import type { FeedbackState } from './stepFeedback'

type Sample = [zone: Zone | null, angle: number | null, tMs: number]

function run(samples: Sample[], from: FeedbackState = initialFeedbackState) {
  let state = from
  return samples.map(([zone, angle, tMs]) => {
    const step = stepFeedback(state, { zone, angle, tMs })
    state = step.state
    return step.cue
  })
}

const audio = (cues: (Cue | null)[]) => cues.map((cue) => cue?.audio ?? null)

describe('stepFeedback: entering a zone', () => {
  it('plays the zone cue once on entry', () => {
    expect(audio(run([['approach', 70, 0]]))).toEqual(['pulse-slow'])
    expect(audio(run([['near', 84, 0]]))).toEqual(['pulse-fast'])
    expect(audio(run([['overshoot', 100, 0]]))).toEqual(['overshoot'])
    expect(audio(run([['pain', 75, 0]]))).toEqual(['warning'])
    expect(run([['target', 90, 0]])[0]).toEqual(ZONE_FEEDBACK.target.enter)
  })

  it('stays silent while far, at rest, or without readings', () => {
    expect(run([['far', 20, 0]])).toEqual([null])
    expect(run([['rest', 20, 0]])).toEqual([null])
    expect(run([[null, null, 0]])).toEqual([null])
    expect(run([['target', null, 0]])).toEqual([null])
  })

  it('plays the success chord only once while the arm stays on the target', () => {
    const cues = run([
      ['target', 90, 0],
      ['target', 90, 1000],
      ['target', 90, 5000],
    ])
    expect(audio(cues)).toEqual(['success', null, null])
  })

  it('does not repeat the chord when the arm jitters across the tolerance edge', () => {
    const cues = run([
      ['target', 90, 0],
      ['near', 87, 100],
      ['target', 90, 200],
    ])
    expect(audio(cues)).toEqual(['success', 'pulse-fast', null])
  })

  it('plays the chord again once the cooldown has passed', () => {
    const cues = run([
      ['target', 90, 0],
      ['overshoot', 95, 500],
      ['target', 90, SUCCESS_COOLDOWN_MS + 1],
    ])
    expect(audio(cues)).toEqual(['success', 'overshoot', 'success'])
  })
})

describe('stepFeedback: repeating zones', () => {
  it('pulses slowly every 700 ms in the approach zone', () => {
    const cues = run([
      ['approach', 70, 0],
      ['approach', 70, 300],
      ['approach', 70, 699],
      ['approach', 70, 700],
      ['approach', 70, 1000],
      ['approach', 70, 1400],
    ])
    expect(audio(cues)).toEqual(['pulse-slow', null, null, 'pulse-slow', null, 'pulse-slow'])
  })

  it('pulses fast every 300 ms near the target', () => {
    const cues = run([
      ['near', 85, 0],
      ['near', 85, 299],
      ['near', 85, 300],
      ['near', 85, 600],
    ])
    expect(audio(cues)).toEqual(['pulse-fast', null, 'pulse-fast', 'pulse-fast'])
  })

  it('keeps buzzing and warning on their own intervals', () => {
    expect(
      audio(
        run([
          ['overshoot', 100, 0],
          ['overshoot', 100, 800],
        ]),
      ),
    ).toEqual(['overshoot', 'overshoot'])
    expect(
      audio(
        run([
          ['pain', 75, 0],
          ['pain', 75, 1499],
          ['pain', 75, 1500],
        ]),
      ),
    ).toEqual(['warning', null, 'warning'])
  })

  it('restarts the interval from the moment of each zone change', () => {
    const cues = run([
      ['approach', 70, 0],
      ['near', 85, 400],
      ['near', 85, 650],
      ['near', 85, 700],
    ])
    expect(audio(cues)).toEqual(['pulse-slow', 'pulse-fast', null, 'pulse-fast'])
  })
})

describe('stepFeedback: clicks while far', () => {
  it('clicks each time the arm crosses a 15-degree band, going up or down', () => {
    const cues = run([
      ['far', 2, 0],
      ['far', 10, 16],
      ['far', 16, 32],
      ['far', 29, 48],
      ['far', 31, 64],
      ['far', 20, 80],
    ])
    expect(cues.map((cue) => cue?.audio ?? null)).toEqual([
      null,
      null,
      'click',
      null,
      'click',
      'click',
    ])
    expect(CLICK_CUE.vibration).toBeNull()
  })

  it('does not click on the first reading, nor in other zones', () => {
    expect(run([['far', 50, 0]])).toEqual([null])
    const cues = run([
      ['far', 10, 0],
      ['approach', 70, 16],
      ['approach', 80, 32],
    ])
    expect(audio(cues)).toEqual([null, 'pulse-slow', null])
  })

  it('clicks when it returns to far from a different band', () => {
    const cues = run([
      ['far', 20, 0],
      ['approach', 40, 16],
      ['far', 20, 32],
    ])
    expect(audio(cues)).toEqual([null, 'pulse-slow', 'click'])
  })
})

describe('stepFeedback: losing readings', () => {
  it('forgets the zone so the next one plays its entry cue, but keeps the success cooldown', () => {
    const lost = stepFeedback(
      stepFeedback(initialFeedbackState, { zone: 'target', angle: 90, tMs: 0 }).state,
      { zone: null, angle: null, tMs: 100 },
    )
    expect(lost.cue).toBeNull()
    expect(lost.state.zone).toBeNull()
    expect(lost.state.lastSuccessAt).toBe(0)

    expect(stepFeedback(lost.state, { zone: 'near', angle: 85, tMs: 200 }).cue?.audio).toBe(
      'pulse-fast',
    )
    expect(stepFeedback(lost.state, { zone: 'target', angle: 90, tMs: 200 }).cue).toBeNull()
  })
})
