import { useEffect, useState } from 'react'

/**
 * Milliseconds since `active` became true, refreshed once per animation frame.
 * Uses requestAnimationFrame only (no timers) and stops as soon as it is inactive.
 */
export function useFrameClock(active: boolean): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) return undefined

    let start: number | null = null
    let handle = 0
    const tick = (now: number) => {
      start ??= now
      setElapsed(now - start)
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(handle)
      setElapsed(0)
    }
  }, [active])

  return elapsed
}
