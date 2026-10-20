import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { isSwipeBack } from './swipe'
import type { PointerPoint } from './swipe'

/**
 * Calls `onBack` when a left-to-right swipe ends inside the element. Uses native pointer events
 * (the watch disables browser touch gestures, so they arrive intact).
 */
export function useSwipeBack(
  target: RefObject<HTMLElement | null>,
  onBack: () => void,
  enabled = true,
): void {
  const callback = useRef(onBack)

  useEffect(() => {
    callback.current = onBack
  })

  useEffect(() => {
    const element = target.current
    if (!enabled || !element) return undefined

    let start: PointerPoint | null = null
    const point = (event: PointerEvent): PointerPoint => ({
      x: event.clientX,
      y: event.clientY,
      t: event.timeStamp,
    })

    const onDown = (event: PointerEvent) => {
      start = point(event)
    }
    const onUp = (event: PointerEvent) => {
      const from = start
      start = null
      if (from && isSwipeBack(from, point(event), element.getBoundingClientRect().width)) {
        callback.current()
      }
    }
    const onCancel = () => {
      start = null
    }

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointerup', onUp)
    element.addEventListener('pointercancel', onCancel)
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointerup', onUp)
      element.removeEventListener('pointercancel', onCancel)
    }
  }, [target, enabled])
}
