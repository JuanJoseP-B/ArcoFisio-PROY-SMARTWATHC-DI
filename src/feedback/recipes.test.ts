import { describe, expect, it } from 'vitest'
import type { AudioCue } from './cues'
import { ZONE_FEEDBACK } from './cues'
import { ATTACK_S, RECIPES, cueLength, recipeFor } from './recipes'

const CUES = Object.keys(RECIPES) as AudioCue[]

describe('RECIPES', () => {
  it('covers every cue the zone table can play', () => {
    const used = new Set<AudioCue>(['click'])
    for (const feedback of Object.values(ZONE_FEEDBACK)) {
      if (feedback.enter) used.add(feedback.enter.audio)
      if (feedback.repeat) used.add(feedback.repeat.audio)
    }
    for (const cue of used) expect(CUES, cue).toContain(cue)
  })

  it('has audible, finite notes that fit inside their envelope', () => {
    for (const cue of CUES) {
      expect(recipeFor(cue).length, cue).toBeGreaterThan(0)
      for (const tone of recipeFor(cue)) {
        expect(tone.from, cue).toBeGreaterThan(20)
        expect(tone.to, cue).toBeGreaterThan(20)
        expect(tone.start, cue).toBeGreaterThanOrEqual(0)
        expect(tone.duration, cue).toBeGreaterThan(ATTACK_S)
        expect(tone.peak, cue).toBeGreaterThan(0)
        expect(tone.peak, cue).toBeLessThanOrEqual(0.3)
      }
    }
  })

  it('makes the success chord from several notes at once', () => {
    const chord = recipeFor('success')
    expect(chord.length).toBeGreaterThanOrEqual(3)
    expect(chord.every((tone) => tone.start < 0.3)).toBe(true)
    expect(new Set(chord.map((tone) => tone.from)).size).toBe(chord.length)
  })

  it('descends in pitch for the overshoot buzz, from 220 to 140 Hz', () => {
    const [buzz] = recipeFor('overshoot')
    expect(buzz?.type).toBe('sawtooth')
    expect(buzz?.from).toBe(220)
    expect(buzz?.to).toBe(140)
  })

  it('uses two beeps for the pain warning', () => {
    expect(recipeFor('warning')).toHaveLength(2)
  })

  it('keeps the approach pulses short enough to finish before the next one', () => {
    expect(cueLength('pulse-slow')).toBeLessThan(0.7)
    expect(cueLength('pulse-fast')).toBeLessThan(0.3)
  })

  it('sounds different for each cue', () => {
    const signatures = CUES.map((cue) => JSON.stringify(recipeFor(cue)))
    expect(new Set(signatures).size).toBe(CUES.length)
  })
})
