import { describe, expect, it, vi } from 'vitest'
import { createWakeLock } from './wakeLock'
import type { WakeLockDocument, WakeLockNavigator } from './wakeLock'

class FakeDocument implements WakeLockDocument {
  visibilityState = 'visible'
  private readonly handlers = new Set<() => void>()
  addEventListener(_type: 'visibilitychange', listener: () => void): void {
    this.handlers.add(listener)
  }
  removeEventListener(_type: 'visibilitychange', listener: () => void): void {
    this.handlers.delete(listener)
  }
  fire(state: 'hidden' | 'visible'): void {
    this.visibilityState = state
    for (const handler of this.handlers) handler()
  }
  get listenerCount(): number {
    return this.handlers.size
  }
}

function fakeNavigator() {
  const release = vi.fn(() => Promise.resolve())
  const request = vi.fn(() => Promise.resolve({ release }))
  const nav: WakeLockNavigator = { wakeLock: { request } }
  return { nav, request, release }
}

describe('createWakeLock', () => {
  it('is unsupported and harmless without navigator.wakeLock', async () => {
    const lock = createWakeLock({}, new FakeDocument())
    expect(lock.supported).toBe(false)
    expect(await lock.acquire()).toBe(false)
    await expect(lock.release()).resolves.toBeUndefined()
  })

  it('requests a screen lock and releases it', async () => {
    const { nav, request, release } = fakeNavigator()
    const lock = createWakeLock(nav, new FakeDocument())
    expect(lock.supported).toBe(true)
    expect(await lock.acquire()).toBe(true)
    expect(request).toHaveBeenCalledWith('screen')

    await lock.release()
    expect(release).toHaveBeenCalledTimes(1)
  })

  it('returns false instead of throwing when the browser refuses', async () => {
    const nav: WakeLockNavigator = {
      wakeLock: { request: () => Promise.reject(new Error('NotAllowedError')) },
    }
    const lock = createWakeLock(nav, new FakeDocument())
    expect(await lock.acquire()).toBe(false)
    await expect(lock.release()).resolves.toBeUndefined()
  })

  it('re-acquires when the tab becomes visible again', async () => {
    const { nav, request } = fakeNavigator()
    const doc = new FakeDocument()
    const lock = createWakeLock(nav, doc)
    await lock.acquire()

    doc.fire('hidden')
    expect(request).toHaveBeenCalledTimes(1)
    doc.fire('visible')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('does not re-acquire after release and removes its listener', async () => {
    const { nav, request } = fakeNavigator()
    const doc = new FakeDocument()
    const lock = createWakeLock(nav, doc)
    await lock.acquire()
    await lock.release()

    expect(doc.listenerCount).toBe(0)
    doc.fire('visible')
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('registers a single visibility listener however often acquire is called', async () => {
    const { nav } = fakeNavigator()
    const doc = new FakeDocument()
    const lock = createWakeLock(nav, doc)
    await lock.acquire()
    await lock.acquire()
    expect(doc.listenerCount).toBe(1)
  })

  it('tolerates a sentinel that was already released', async () => {
    const nav: WakeLockNavigator = {
      wakeLock: {
        request: () => Promise.resolve({ release: () => Promise.reject(new Error('released')) }),
      },
    }
    const lock = createWakeLock(nav, new FakeDocument())
    await lock.acquire()
    await expect(lock.release()).resolves.toBeUndefined()
  })
})
