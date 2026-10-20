import { describe, expect, it } from 'vitest'
import { createAudioEngine, DEFAULT_VOLUME } from './audioEngine'
import type { AudioContextLike, AudioParamLike, GainLike, OscillatorLike } from './audioEngine'
import { recipeFor } from './recipes'

class FakeParam implements AudioParamLike {
  value = 1
  calls: [string, number, number][] = []
  setValueAtTime(value: number, time: number) {
    this.calls.push(['set', value, time])
  }
  linearRampToValueAtTime(value: number, time: number) {
    this.calls.push(['linear', value, time])
  }
  exponentialRampToValueAtTime(value: number, time: number) {
    this.calls.push(['exp', value, time])
  }
}

class FakeOscillator implements OscillatorLike {
  type = 'sine'
  frequency = new FakeParam()
  onended: (() => void) | null = null
  connectedTo: unknown = null
  started: number | null = null
  stopped: number | null = null
  disconnected = false
  connect(destination: unknown) {
    this.connectedTo = destination
  }
  disconnect() {
    this.disconnected = true
  }
  start(when: number) {
    this.started = when
  }
  stop(when: number) {
    this.stopped = when
  }
}

class FakeGain implements GainLike {
  gain = new FakeParam()
  connectedTo: unknown = null
  disconnected = false
  connect(destination: unknown) {
    this.connectedTo = destination
  }
  disconnect() {
    this.disconnected = true
  }
}

class FakeContext implements AudioContextLike {
  currentTime = 10
  state = 'suspended'
  readonly destination = { speaker: true }
  oscillators: FakeOscillator[] = []
  gains: FakeGain[] = []
  closed = false
  resumeResult: 'running' | 'suspended' | 'throw' = 'running'

  async resume() {
    if (this.resumeResult === 'throw') throw new Error('blocked')
    this.state = this.resumeResult
  }
  async close() {
    this.closed = true
  }
  createOscillator() {
    const osc = new FakeOscillator()
    this.oscillators.push(osc)
    return osc
  }
  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }
}

const setup = () => {
  const ctx = new FakeContext()
  return { ctx, engine: createAudioEngine(() => ctx) }
}

describe('createAudioEngine', () => {
  it('stays silent and locked until a gesture unlocks it', () => {
    const { ctx, engine } = setup()
    expect(engine.state).toBe('locked')
    expect(engine.play('click')).toBe(false)
    expect(ctx.oscillators).toHaveLength(0)
  })

  it('unlocks by resuming the context, then plays', async () => {
    const { ctx, engine } = setup()
    expect(await engine.unlock()).toBe(true)
    expect(engine.state).toBe('ready')
    expect(engine.play('pulse-slow')).toBe(true)
    expect(ctx.oscillators).toHaveLength(1)
  })

  it('stays locked when the browser keeps the context suspended or refuses', async () => {
    const suspended = setup()
    suspended.ctx.resumeResult = 'suspended'
    expect(await suspended.engine.unlock()).toBe(false)
    expect(suspended.engine.state).toBe('locked')

    const refused = setup()
    refused.ctx.resumeResult = 'throw'
    expect(await refused.engine.unlock()).toBe(false)
    expect(refused.engine.play('click')).toBe(false)
  })

  it('reports unsupported when there is no Web Audio, without throwing', async () => {
    const none = createAudioEngine(() => null)
    expect(await none.unlock()).toBe(false)
    expect(none.state).toBe('unsupported')
    expect(none.play('success')).toBe(false)

    const broken = createAudioEngine(() => {
      throw new Error('no audio')
    })
    expect(await broken.unlock()).toBe(false)
    expect(broken.state).toBe('unsupported')
  })

  it('plays nothing while sound is off, and resumes when turned back on', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.setEnabled(false)
    expect(engine.play('success')).toBe(false)
    expect(ctx.oscillators).toHaveLength(0)

    engine.setEnabled(true)
    expect(engine.play('success')).toBe(true)
  })

  it('builds one oscillator per note of the recipe, wired through an envelope to the master', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.play('success')

    const notes = recipeFor('success')
    expect(ctx.oscillators).toHaveLength(notes.length)
    const master = ctx.gains[0]!
    expect(master.connectedTo).toBe(ctx.destination)

    ctx.oscillators.forEach((osc, i) => {
      const tone = notes[i]!
      const envelope = ctx.gains[i + 1]!
      expect(osc.type).toBe(tone.type)
      expect(osc.connectedTo).toBe(envelope)
      expect(envelope.connectedTo).toBe(master)
      expect(osc.started).toBeCloseTo(10 + tone.start, 6)
      expect(osc.stopped).toBeGreaterThan(10 + tone.start + tone.duration)
    })
  })

  it('shapes each note with a short attack and an exponential decay to near silence', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.play('pulse-fast')

    const tone = recipeFor('pulse-fast')[0]!
    const calls = ctx.gains[1]!.gain.calls
    expect(calls[0]).toEqual(['set', 0.0001, 10])
    expect(calls[1]?.[0]).toBe('linear')
    expect(calls[1]?.[1]).toBe(tone.peak)
    expect(calls[2]?.[0]).toBe('exp')
    expect(calls[2]?.[1]).toBe(0.0001)
    expect(calls[2]?.[2]).toBeCloseTo(10 + tone.duration, 6)
  })

  it('glides the pitch down for the overshoot buzz', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.play('overshoot')
    const calls = ctx.oscillators[0]!.frequency.calls
    expect(calls[0]).toEqual(['set', 220, 10])
    expect(calls[1]?.slice(0, 2)).toEqual(['exp', 140])
  })

  it('does not glide a steady note', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.play('click')
    expect(ctx.oscillators[0]!.frequency.calls).toHaveLength(1)
  })

  it('applies the volume to the master gain, clamped to 0..1', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    const master = ctx.gains[0]!
    expect(master.gain.value).toBe(DEFAULT_VOLUME)
    engine.setVolume(0.2)
    expect(master.gain.value).toBe(0.2)
    engine.setVolume(7)
    expect(master.gain.value).toBe(1)
    engine.setVolume(-1)
    expect(master.gain.value).toBe(0)
  })

  it('remembers a volume chosen before the context exists', async () => {
    const { ctx, engine } = setup()
    engine.setVolume(0.3)
    await engine.unlock()
    expect(ctx.gains[0]!.gain.value).toBe(0.3)
  })

  it('frees the nodes of a note when it ends', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.play('click')
    ctx.oscillators[0]!.onended?.()
    expect(ctx.oscillators[0]!.disconnected).toBe(true)
    expect(ctx.gains[1]!.disconnected).toBe(true)
  })

  it('does not play when the browser suspended the context again', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    ctx.state = 'suspended'
    expect(engine.play('click')).toBe(false)
  })

  it('closes the context on dispose and locks again', async () => {
    const { ctx, engine } = setup()
    await engine.unlock()
    engine.dispose()
    expect(ctx.closed).toBe(true)
    expect(engine.state).toBe('locked')
    expect(engine.play('click')).toBe(false)
  })
})
