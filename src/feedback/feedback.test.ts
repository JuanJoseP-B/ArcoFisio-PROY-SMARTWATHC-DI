import { describe, expect, it, vi } from 'vitest'
import type { AudioEngine } from './audioEngine'
import type { AudioCue } from './cues'
import { createFeedback } from './feedback'
import type { Vibration } from './vibration'

function fakes() {
  const played: AudioCue[] = []
  const buzzed: (readonly number[])[] = []
  const audio: AudioEngine = {
    state: 'ready',
    unlock: () => Promise.resolve(true),
    play: vi.fn((cue: AudioCue) => {
      played.push(cue)
      return true
    }),
    setEnabled: vi.fn(),
    setVolume: vi.fn(),
    dispose: vi.fn(),
  }
  const vibration: Vibration = {
    supported: true,
    vibrate: vi.fn((pattern) => {
      buzzed.push(pattern)
      return true
    }),
    cancel: vi.fn(),
    setEnabled: vi.fn(),
  }
  return { audio, vibration, played, buzzed, feedback: createFeedback(audio, vibration) }
}

describe('createFeedback', () => {
  it('plays the sound and the vibration of the zone it enters', () => {
    const { feedback, played, buzzed } = fakes()
    feedback.tick({ zone: 'target', angle: 90, tMs: 0 })
    expect(played).toEqual(['success'])
    expect(buzzed).toEqual([[80, 60, 80]])
  })

  it('makes each zone sound and vibrate differently', () => {
    const seen = new Set<string>()
    for (const [zone, angle] of [
      ['approach', 70],
      ['near', 85],
      ['target', 90],
      ['overshoot', 100],
      ['pain', 75],
    ] as const) {
      const { feedback, played, buzzed } = fakes()
      feedback.tick({ zone, angle, tMs: 0 })
      expect(played, zone).toHaveLength(1)
      expect(buzzed, zone).toHaveLength(1)
      seen.add(`${played[0]}|${JSON.stringify(buzzed[0])}`)
    }
    expect(seen.size).toBe(5)
  })

  it('clicks without vibrating while far', () => {
    const { feedback, played, buzzed } = fakes()
    feedback.tick({ zone: 'far', angle: 10, tMs: 0 })
    feedback.tick({ zone: 'far', angle: 20, tMs: 16 })
    expect(played).toEqual(['click'])
    expect(buzzed).toEqual([])
  })

  it('repeats the pulse on its interval as the frames go by', () => {
    const { feedback, played } = fakes()
    for (const t of [0, 300, 650, 700, 1100, 1400]) {
      feedback.tick({ zone: 'approach', angle: 70, tMs: t })
    }
    expect(played).toEqual(['pulse-slow', 'pulse-slow', 'pulse-slow'])
  })

  it('hands the Settings switches to the speaker and the motor', () => {
    const { feedback, audio, vibration } = fakes()
    feedback.applySettings({ sound: false, vibration: true })
    expect(audio.setEnabled).toHaveBeenCalledWith(false)
    expect(vibration.setEnabled).toHaveBeenCalledWith(true)
  })

  it('stops vibrating and starts the zone over after stop()', () => {
    const { feedback, vibration, played } = fakes()
    feedback.tick({ zone: 'near', angle: 85, tMs: 0 })
    feedback.stop()
    expect(vibration.cancel).toHaveBeenCalled()

    feedback.tick({ zone: 'near', angle: 85, tMs: 10 })
    expect(played).toEqual(['pulse-fast', 'pulse-fast'])
  })

  it('does nothing without readings', () => {
    const { feedback, played, buzzed } = fakes()
    feedback.tick({ zone: null, angle: null, tMs: 0 })
    expect(played).toEqual([])
    expect(buzzed).toEqual([])
  })

  it('builds real engines by default without touching the speaker until unlocked', () => {
    const feedback = createFeedback()
    expect(feedback.audio.state).toBe('locked')
    expect(() => feedback.tick({ zone: 'target', angle: 90, tMs: 0 })).not.toThrow()
  })
})
