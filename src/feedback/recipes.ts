import type { AudioCue } from './cues'

/** One oscillator note: it glides from `from` to `to` Hz over `duration` seconds. */
export interface Tone {
  readonly type: 'sine' | 'triangle' | 'square' | 'sawtooth'
  readonly from: number
  readonly to: number
  /** Seconds after the cue starts. */
  readonly start: number
  readonly duration: number
  /** Peak gain, 0 to 1, before the master volume. */
  readonly peak: number
}

const note = (
  type: Tone['type'],
  hz: number,
  start: number,
  duration: number,
  peak: number,
): Tone => ({ type, from: hz, to: hz, start, duration, peak })

/** Attack time of every note, in seconds: short enough to feel instant, long enough not to pop. */
export const ATTACK_S = 0.005

/**
 * What each cue is made of. Rewritten from the prototype's pitches (350, 440, 580, 880 and
 * 1760 Hz, sawtooth 220 to 140 Hz) as clean notes with a soft envelope.
 */
export const RECIPES: Readonly<Record<AudioCue, readonly Tone[]>> = {
  click: [note('sine', 1760, 0, 0.03, 0.12)],
  'pulse-slow': [note('sine', 440, 0, 0.16, 0.22)],
  'pulse-fast': [note('sine', 580, 0, 0.08, 0.22)],
  success: [
    note('sine', 523.25, 0, 0.7, 0.18),
    note('sine', 659.25, 0.06, 0.64, 0.16),
    note('sine', 783.99, 0.12, 0.58, 0.16),
    note('sine', 1046.5, 0.18, 0.5, 0.08),
  ],
  overshoot: [{ type: 'sawtooth', from: 220, to: 140, start: 0, duration: 0.4, peak: 0.16 }],
  warning: [note('triangle', 350, 0, 0.12, 0.26), note('triangle', 350, 0.2, 0.12, 0.26)],
}

export const recipeFor = (cue: AudioCue): readonly Tone[] => RECIPES[cue]

/** Seconds until the last note of the cue has faded out. */
export const cueLength = (cue: AudioCue): number =>
  Math.max(...recipeFor(cue).map((tone) => tone.start + tone.duration))
