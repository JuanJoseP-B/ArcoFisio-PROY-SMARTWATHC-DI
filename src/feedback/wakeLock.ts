export interface WakeLockSentinelLike {
  release(): Promise<void>
}

export interface WakeLockNavigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinelLike>
  }
}

export interface WakeLockDocument {
  readonly visibilityState: string
  addEventListener(type: 'visibilitychange', listener: () => void): void
  removeEventListener(type: 'visibilitychange', listener: () => void): void
}

export interface WakeLock {
  readonly supported: boolean
  acquire(): Promise<boolean>
  release(): Promise<void>
}

/**
 * Keeps the screen on while wanted. Browsers drop the lock when the tab is
 * hidden, so it is requested again when the tab becomes visible.
 */
export function createWakeLock(
  nav: WakeLockNavigator = navigator,
  doc: WakeLockDocument = document,
): WakeLock {
  const api = nav.wakeLock
  let sentinel: WakeLockSentinelLike | null = null
  let wanted = false

  const request = async (): Promise<boolean> => {
    if (!api) return false
    try {
      sentinel = await api.request('screen')
      return true
    } catch {
      sentinel = null
      return false
    }
  }

  const onVisible = (): void => {
    if (wanted && doc.visibilityState === 'visible') void request()
  }

  return {
    supported: api !== undefined,
    async acquire() {
      if (!api) return false
      if (!wanted) doc.addEventListener('visibilitychange', onVisible)
      wanted = true
      return request()
    },
    async release() {
      if (wanted) doc.removeEventListener('visibilitychange', onVisible)
      wanted = false
      const held = sentinel
      sentinel = null
      try {
        await held?.release()
      } catch {
        // already released by the browser
      }
    },
  }
}
