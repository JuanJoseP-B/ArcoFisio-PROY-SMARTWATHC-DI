import type { Settings } from '../data/types'
import type { AudioEngine } from './audioEngine'
import { createAudioEngine } from './audioEngine'
import type { Cue } from './cues'
import { initialFeedbackState, stepFeedback } from './stepFeedback'
import type { FeedbackInput, FeedbackState } from './stepFeedback'
import type { Vibration } from './vibration'
import { createVibration } from './vibration'

export interface Feedback {
  readonly audio: AudioEngine
  readonly vibration: Vibration
  /** Call on every animation frame with the latest zone and angle. */
  tick(input: FeedbackInput): void
  /** Plays a cue on the speaker and the motor, each only if it is on and supported. */
  play(cue: Cue): void
  /** Applies the Settings switches for sound and vibration. */
  applySettings(settings: Pick<Settings, 'sound' | 'vibration'>): void
  /** Forgets the current zone and cancels any vibration (leaving a session, pausing). */
  stop(): void
}

export function createFeedback(
  audio: AudioEngine = createAudioEngine(),
  vibration: Vibration = createVibration(),
): Feedback {
  let state: FeedbackState = initialFeedbackState

  const play = (cue: Cue): void => {
    audio.play(cue.audio)
    if (cue.vibration) vibration.vibrate(cue.vibration)
  }

  return {
    audio,
    vibration,
    play,
    tick(input) {
      const step = stepFeedback(state, input)
      state = step.state
      if (step.cue) play(step.cue)
    },
    applySettings(settings) {
      audio.setEnabled(settings.sound)
      vibration.setEnabled(settings.vibration)
    },
    stop() {
      state = initialFeedbackState
      vibration.cancel()
    },
  }
}
