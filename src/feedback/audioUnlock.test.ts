import { describe, expect, it, vi } from 'vitest'
import type { AudioEngine, AudioState } from './audioEngine'
import { installAudioUnlock } from './audioUnlock'

function fakeEngine(results: boolean[], state: AudioState = 'locked') {
  const unlock = vi.fn(() => Promise.resolve(results.shift() ?? true))
  const engine: AudioEngine = {
    get state() {
      return state
    },
    unlock,
    play: () => false,
    setEnabled: () => undefined,
    setVolume: () => undefined,
    dispose: () => undefined,
  }
  return { engine, unlock }
}

const tap = (target: EventTarget, type = 'pointerdown') => target.dispatchEvent(new Event(type))
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('installAudioUnlock', () => {
  it('unlocks on the first gesture and stops listening', async () => {
    const target = new EventTarget()
    const { engine, unlock } = fakeEngine([true])
    installAudioUnlock(engine, target)

    tap(target)
    await flush()
    tap(target)
    tap(target, 'touchend')
    await flush()

    expect(unlock).toHaveBeenCalledTimes(1)
  })

  it('listens to touch, pointer and keyboard gestures', async () => {
    for (const type of ['pointerdown', 'touchend', 'keydown']) {
      const target = new EventTarget()
      const { engine, unlock } = fakeEngine([true])
      installAudioUnlock(engine, target)
      tap(target, type)
      await flush()
      expect(unlock, type).toHaveBeenCalledTimes(1)
    }
  })

  it('keeps listening when the browser still refuses, and retries on the next gesture', async () => {
    const target = new EventTarget()
    const { engine, unlock } = fakeEngine([false, true])
    installAudioUnlock(engine, target)

    tap(target)
    await flush()
    tap(target)
    await flush()
    tap(target)
    await flush()

    expect(unlock).toHaveBeenCalledTimes(2)
  })

  it('does not stack calls while one unlock is still pending', async () => {
    const target = new EventTarget()
    const { engine, unlock } = fakeEngine([true])
    installAudioUnlock(engine, target)

    tap(target)
    tap(target)
    tap(target)
    await flush()

    expect(unlock).toHaveBeenCalledTimes(1)
  })

  it('gives up for good when the device has no Web Audio', async () => {
    const target = new EventTarget()
    const { engine, unlock } = fakeEngine([false], 'unsupported')
    installAudioUnlock(engine, target)

    tap(target)
    await flush()
    tap(target)
    await flush()

    expect(unlock).toHaveBeenCalledTimes(1)
  })

  it('can be removed before any gesture', async () => {
    const target = new EventTarget()
    const { engine, unlock } = fakeEngine([true])
    const remove = installAudioUnlock(engine, target)
    remove()

    tap(target)
    await flush()
    expect(unlock).not.toHaveBeenCalled()
  })
})
