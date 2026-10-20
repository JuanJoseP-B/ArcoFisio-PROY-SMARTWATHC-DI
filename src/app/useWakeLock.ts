import { useEffect } from 'react'
import { createWakeLock } from '../feedback/wakeLock'

/** Keeps the screen awake while the component is on show. */
export function useWakeLock(): void {
  useEffect(() => {
    const lock = createWakeLock()
    void lock.acquire()
    return () => {
      void lock.release()
    }
  }, [])
}
