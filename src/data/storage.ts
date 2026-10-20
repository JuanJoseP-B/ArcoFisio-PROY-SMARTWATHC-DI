import { migrate } from './migrations'
import { SCHEMA_VERSION, STORAGE_PREFIX } from './types'
import type { StorageKey } from './types'

export type StorageBackend = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

export interface StorageClient {
  read<T>(key: StorageKey, parse: (value: unknown) => T | null): T | null
  write(key: StorageKey, value: unknown): void
  remove(key: StorageKey): void
  clearAll(): void
  isFallback(): boolean
}

const PROBE_KEY = `${STORAGE_PREFIX}probe`

const fullKey = (key: StorageKey) => `${STORAGE_PREFIX}${key}`

export function resolveBackend(): StorageBackend | null {
  try {
    const candidate = globalThis.localStorage
    candidate.setItem(PROBE_KEY, '1')
    candidate.removeItem(PROBE_KEY)
    return candidate
  } catch {
    return null
  }
}

function unwrap(raw: string): { schema: number; data: unknown } | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const { schema, data } = parsed as { schema?: unknown; data?: unknown }
    if (typeof schema !== 'number' || data === undefined) return null
    return { schema, data }
  } catch {
    return null
  }
}

export function createStorage(backend: StorageBackend | null = resolveBackend()): StorageClient {
  const memory = new Map<string, string>()
  let fallback = backend === null

  function getRaw(key: string): string | null {
    const cached = memory.get(key)
    if (cached !== undefined) return cached
    if (!backend) return null
    try {
      return backend.getItem(key)
    } catch {
      fallback = true
      return null
    }
  }

  function removeRaw(key: string): void {
    memory.delete(key)
    try {
      backend?.removeItem(key)
    } catch {
      fallback = true
    }
  }

  function discard(key: StorageKey, reason: string): null {
    console.warn(`[arcofisio] discarding "${key}": ${reason}`)
    removeRaw(fullKey(key))
    return null
  }

  return {
    read(key, parse) {
      const raw = getRaw(fullKey(key))
      if (raw === null) return null

      const envelope = unwrap(raw)
      if (!envelope) return discard(key, 'unreadable data')

      let data = envelope.data
      if (envelope.schema !== SCHEMA_VERSION) {
        const migrated = migrate(envelope.schema, SCHEMA_VERSION, data)
        if (!migrated.ok) return discard(key, `unsupported schema ${envelope.schema}`)
        data = migrated.data
      }

      const value = parse(data)
      return value === null ? discard(key, 'invalid shape') : value
    },

    write(key, value) {
      const name = fullKey(key)
      const raw = JSON.stringify({ schema: SCHEMA_VERSION, data: value })
      try {
        if (!backend) throw new Error('no backend')
        backend.setItem(name, raw)
        memory.delete(name)
      } catch {
        fallback = true
        memory.set(name, raw)
      }
    },

    remove(key) {
      removeRaw(fullKey(key))
    },

    clearAll() {
      memory.clear()
      if (!backend) return
      try {
        const names: string[] = []
        for (let i = 0; i < backend.length; i++) {
          const name = backend.key(i)
          if (name?.startsWith(STORAGE_PREFIX)) names.push(name)
        }
        names.forEach((name) => backend.removeItem(name))
      } catch {
        fallback = true
      }
    },

    isFallback: () => fallback,
  }
}
