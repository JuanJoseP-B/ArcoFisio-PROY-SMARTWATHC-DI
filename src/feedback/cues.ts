import type { Zone } from '../domain/zones'

/** Pulse spacing of the approach zones; the visual halo uses the same two numbers. */
export const PULSE_SLOW_MS = 700
export const PULSE_FAST_MS = 300
export const OVERSHOOT_REPEAT_MS = 800
export const PAIN_REPEAT_MS = 1500

/** In the far zone a soft click marks every 15 degrees the arm travels. */
export const CLICK_STEP_DEG = 15

/** The success chord is not repeated within this window, so edge jitter cannot spam it. */
export const SUCCESS_COOLDOWN_MS = 1500

export type AudioCue = 'click' | 'pulse-slow' | 'pulse-fast' | 'success' | 'overshoot' | 'warning'

/** `navigator.vibrate` pattern: vibrate, pause, vibrate... in milliseconds. */
export type VibrationPattern = readonly number[]

export interface Cue {
  readonly audio: AudioCue
  readonly vibration: VibrationPattern | null
}

export interface ZoneFeedback {
  /** Played once when the arm enters the zone. */
  readonly enter: Cue | null
  /** Played again every `repeatMs` while the arm stays in the zone. */
  readonly repeat: Cue | null
  readonly repeatMs: number | null
}

/** The soft click of the far zone; it has no vibration. */
export const CLICK_CUE: Cue = { audio: 'click', vibration: null }

const SLOW: Cue = { audio: 'pulse-slow', vibration: [40] }
const FAST: Cue = { audio: 'pulse-fast', vibration: [60] }
const SUCCESS: Cue = { audio: 'success', vibration: [80, 60, 80] }
const OVERSHOOT: Cue = { audio: 'overshoot', vibration: [200] }
const WARNING: Cue = { audio: 'warning', vibration: [100, 80, 100, 80, 100] }

const SILENT: ZoneFeedback = { enter: null, repeat: null, repeatMs: null }

/** Single source of what each zone sounds and feels like (spec §6). */
export const ZONE_FEEDBACK: Readonly<Record<Zone, ZoneFeedback>> = {
  far: SILENT,
  approach: { enter: SLOW, repeat: SLOW, repeatMs: PULSE_SLOW_MS },
  near: { enter: FAST, repeat: FAST, repeatMs: PULSE_FAST_MS },
  target: { enter: SUCCESS, repeat: null, repeatMs: null },
  overshoot: { enter: OVERSHOOT, repeat: OVERSHOOT, repeatMs: OVERSHOOT_REPEAT_MS },
  pain: { enter: WARNING, repeat: WARNING, repeatMs: PAIN_REPEAT_MS },
  rest: SILENT,
}
