import type { AudioCue } from './cues'
import { ATTACK_S, recipeFor } from './recipes'

/** The few Web Audio members the engine uses, so tests can stand in for the browser. */
export interface AudioParamLike {
  value: number
  setValueAtTime(value: number, time: number): unknown
  linearRampToValueAtTime(value: number, time: number): unknown
  exponentialRampToValueAtTime(value: number, time: number): unknown
}

export interface AudioNodeLike {
  connect(destination: unknown): unknown
  disconnect(): void
}

export interface OscillatorLike extends AudioNodeLike {
  type: string
  readonly frequency: AudioParamLike
  onended: (() => void) | null
  start(when: number): void
  stop(when: number): void
}

export interface GainLike extends AudioNodeLike {
  readonly gain: AudioParamLike
}

export interface AudioContextLike {
  readonly currentTime: number
  readonly state: string
  readonly destination: unknown
  resume(): Promise<void>
  close(): Promise<void>
  createOscillator(): OscillatorLike
  createGain(): GainLike
}

export type ContextFactory = () => AudioContextLike | null

/** `locked` until a tap has resumed the context (autoplay policy), `unsupported` without Web Audio. */
export type AudioState = 'locked' | 'ready' | 'unsupported'

export interface AudioEngine {
  readonly state: AudioState
  /** Call from a user gesture: browsers only start audio after one. */
  unlock(): Promise<boolean>
  /** Plays a cue; returns false (and stays silent) when muted, locked or unsupported. */
  play(cue: AudioCue): boolean
  setEnabled(enabled: boolean): void
  /** 0 to 1, applied to everything the engine plays. */
  setVolume(volume: number): void
  dispose(): void
}

export const DEFAULT_VOLUME = 0.6
const SILENT_GAIN = 0.0001
/** Notes are stopped a hair after their envelope ends so the tail is never cut. */
const STOP_PADDING_S = 0.02

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

export function browserContextFactory(): AudioContextLike | null {
  const Ctor =
    typeof window === 'undefined'
      ? undefined
      : (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
  return Ctor ? (new Ctor() as unknown as AudioContextLike) : null
}

export function createAudioEngine(factory: ContextFactory = browserContextFactory): AudioEngine {
  let context: AudioContextLike | null = null
  let master: GainLike | null = null
  let state: AudioState = 'locked'
  let enabled = true
  let volume = DEFAULT_VOLUME

  const ensureContext = (): AudioContextLike | null => {
    if (context) return context
    try {
      context = factory()
    } catch {
      context = null
    }
    if (!context) {
      state = 'unsupported'
      return null
    }
    master = context.createGain()
    master.gain.value = volume
    master.connect(context.destination)
    return context
  }

  const playTone = (ctx: AudioContextLike, output: GainLike, cue: AudioCue): void => {
    for (const tone of recipeFor(cue)) {
      const begin = ctx.currentTime + tone.start
      const end = begin + tone.duration

      const oscillator = ctx.createOscillator()
      oscillator.type = tone.type
      oscillator.frequency.setValueAtTime(tone.from, begin)
      if (tone.to !== tone.from) oscillator.frequency.exponentialRampToValueAtTime(tone.to, end)

      const envelope = ctx.createGain()
      envelope.gain.setValueAtTime(SILENT_GAIN, begin)
      envelope.gain.linearRampToValueAtTime(tone.peak, begin + ATTACK_S)
      envelope.gain.exponentialRampToValueAtTime(SILENT_GAIN, end)

      oscillator.connect(envelope)
      envelope.connect(output)
      oscillator.onended = () => {
        oscillator.disconnect()
        envelope.disconnect()
      }
      oscillator.start(begin)
      oscillator.stop(end + STOP_PADDING_S)
    }
  }

  return {
    get state() {
      return state
    },

    async unlock() {
      const ctx = ensureContext()
      if (!ctx) return false
      try {
        await ctx.resume()
      } catch {
        return false
      }
      state = ctx.state === 'running' ? 'ready' : 'locked'
      return state === 'ready'
    },

    play(cue) {
      if (!enabled || state !== 'ready' || !context || !master) return false
      if (context.state !== 'running') return false
      try {
        playTone(context, master, cue)
      } catch {
        return false
      }
      return true
    },

    setEnabled(next) {
      enabled = next
    },

    setVolume(next) {
      volume = clamp01(next)
      if (master) master.gain.value = volume
    },

    dispose() {
      const closing = context
      context = null
      master = null
      state = 'locked'
      void closing?.close().catch(() => undefined)
    },
  }
}
