import { useEffect, useRef } from 'react'

/**
 * Calls `onDelta` once per animation frame with the milliseconds since the previous frame,
 * while `active`. The first frame after turning on only sets the starting point, so the time
 * spent inactive is never counted. Uses requestAnimationFrame only.
 */
export function useFrameDelta(active: boolean, onDelta: (dtMs: number) => void): void {
  const callback = useRef(onDelta)

  useEffect(() => {
    callback.current = onDelta
  })

  useEffect(() => {
    if (!active) return undefined

    let last: number | null = null
    let handle = 0
    const tick = (now: number) => {
      if (last !== null) callback.current(now - last)
      last = now
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(handle)
  }, [active])
}
