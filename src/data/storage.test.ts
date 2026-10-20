import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage, resolveBackend } from './storage'
import { FakeStorage } from './testStorage'

const KEY = 'arcofisio:v1:settings'
const asNumber = (value: unknown) => (typeof value === 'number' ? value : null)

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  warn.mockRestore()
})

describe('with a working localStorage', () => {
  it('writes a versioned envelope under the arcofisio:v1: prefix', () => {
    const backend = new FakeStorage()
    createStorage(backend).write('settings', 7)
    expect(JSON.parse(backend.getItem(KEY) ?? '')).toEqual({ schema: 1, data: 7 })
  })

  it('reads back what it wrote and returns null for absent keys', () => {
    const storage = createStorage(new FakeStorage())
    expect(storage.read('settings', asNumber)).toBeNull()
    storage.write('settings', 42)
    expect(storage.read('settings', asNumber)).toBe(42)
    expect(storage.isFallback()).toBe(false)
  })

  it('removes a single key', () => {
    const storage = createStorage(new FakeStorage())
    storage.write('settings', 1)
    storage.remove('settings')
    expect(storage.read('settings', asNumber)).toBeNull()
  })

  it('clears only keys with its own prefix', () => {
    const backend = new FakeStorage()
    backend.seed('other-app:key', 'keep')
    const storage = createStorage(backend)
    storage.write('settings', 1)
    storage.write('sessions', 2)
    storage.clearAll()
    expect(backend.has(KEY)).toBe(false)
    expect(backend.has('arcofisio:v1:sessions')).toBe(false)
    expect(backend.has('other-app:key')).toBe(true)
  })
})

describe('with corrupted data', () => {
  it.each([
    ['invalid JSON', '{not json'],
    ['a non-object value', '12'],
    ['an envelope without data', '{"schema":1}'],
    ['an envelope without schema', '{"data":1}'],
    ['a payload of the wrong shape', '{"schema":1,"data":"text"}'],
  ])('discards %s with a warning', (_label, raw) => {
    const backend = new FakeStorage()
    backend.seed(KEY, raw)
    const storage = createStorage(backend)
    expect(storage.read('settings', asNumber)).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(backend.has(KEY)).toBe(false)
  })

  it('discards data from an unknown future or past schema', () => {
    const backend = new FakeStorage()
    backend.seed(KEY, '{"schema":99,"data":5}')
    expect(createStorage(backend).read('settings', asNumber)).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})

describe('when localStorage is blocked', () => {
  it('works from memory when there is no backend at all', () => {
    const storage = createStorage(null)
    expect(storage.isFallback()).toBe(true)
    storage.write('settings', 5)
    expect(storage.read('settings', asNumber)).toBe(5)
    storage.remove('settings')
    expect(storage.read('settings', asNumber)).toBeNull()
    expect(() => storage.clearAll()).not.toThrow()
  })

  it('survives reads that throw', () => {
    const backend = new FakeStorage()
    backend.failReads = true
    const storage = createStorage(backend)
    expect(storage.read('settings', asNumber)).toBeNull()
    expect(storage.isFallback()).toBe(true)
  })

  it('survives clearAll when the backend throws while listing', () => {
    const backend = new FakeStorage()
    backend.key = () => {
      throw new Error('blocked')
    }
    backend.seed(KEY, '1')
    const storage = createStorage(backend)
    expect(() => storage.clearAll()).not.toThrow()
    expect(storage.isFallback()).toBe(true)
  })

  it('resolveBackend returns null when the accessor throws', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    try {
      expect(resolveBackend()).toBeNull()
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original)
    }
  })

  it('resolveBackend returns the real storage when it works', () => {
    expect(resolveBackend()).not.toBeNull()
  })
})

describe('when localStorage is full', () => {
  it('keeps the value in memory and flags the fallback', () => {
    const backend = new FakeStorage()
    backend.failWrites = true
    const storage = createStorage(backend)
    storage.write('settings', 9)
    expect(storage.isFallback()).toBe(true)
    expect(storage.read('settings', asNumber)).toBe(9)
    expect(backend.has(KEY)).toBe(false)
  })

  it('returns to the real storage once writes work again', () => {
    const backend = new FakeStorage()
    backend.failWrites = true
    const storage = createStorage(backend)
    storage.write('settings', 1)
    backend.failWrites = false
    storage.write('settings', 2)
    expect(JSON.parse(backend.getItem(KEY) ?? '').data).toBe(2)
    expect(storage.read('settings', asNumber)).toBe(2)
  })

  it('clearAll also drops the in-memory copies', () => {
    const backend = new FakeStorage()
    backend.failWrites = true
    const storage = createStorage(backend)
    storage.write('settings', 1)
    storage.clearAll()
    expect(storage.read('settings', asNumber)).toBeNull()
  })
})
