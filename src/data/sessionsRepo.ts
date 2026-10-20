import type { StorageClient } from './storage'
import { MAX_SESSIONS } from './types'
import type { Session } from './types'
import { parseSession, parseSessions } from './validators'

export interface SessionsRepo {
  list(): Session[]
  recent(count: number): Session[]
  last(): Session | null
  add(session: Session): boolean
  clear(): void
}

export function createSessionsRepo(storage: StorageClient): SessionsRepo {
  const list = (): Session[] => storage.read('sessions', parseSessions) ?? []

  return {
    list,
    recent: (count) => (count > 0 ? list().slice(-count).reverse() : []),
    last: () => list().at(-1) ?? null,

    add(session) {
      const valid = parseSession(session)
      if (!valid) return false
      const next = [...list(), valid]
      storage.write('sessions', next.length > MAX_SESSIONS ? next.slice(-MAX_SESSIONS) : next)
      return true
    },

    clear: () => storage.remove('sessions'),
  }
}
