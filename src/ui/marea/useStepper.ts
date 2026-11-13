import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

const HOLD_DELAY_MS = 450
const HOLD_REPEAT_MS = 110

interface StepperInput {
  value: number
  min: number
  max: number
  step: number
  onChange(value: number): void
}

type Direction = 1 | -1

export interface StepperHandlers {
  /** Click (or Enter and Space): one step, unless the click ends a hold that already stepped. */
  press(direction: Direction): void
  /** Pointer handlers that repeat the step while a button is held. */
  holdProps(direction: Direction): {
    onPointerDown(event: PointerEvent): void
    onPointerUp(): void
    onPointerLeave(): void
    onPointerCancel(): void
  }
  /** Arrow keys on the group step the value from whichever button has the focus. */
  onKeyDown(event: KeyboardEvent): void
}

/**
 * Step logic of the `-  value  +` selector: single steps, hold-to-repeat after 450 ms (every
 * 110 ms) and arrow keys. The latest props live in a ref so a fast repeat never reads a stale
 * value, and the repeat timer is cleared on release and on unmount.
 */
export function useStepper(input: StepperInput): StepperHandlers {
  const latest = useRef(input)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repeated = useRef(false)

  useEffect(() => {
    latest.current = input
  })

  const stop = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }, [])
  useEffect(() => stop, [stop])

  /** Moves one step; false when the value cannot go any further. */
  const move = useCallback((direction: Direction): boolean => {
    const now = latest.current
    const next = Math.min(now.max, Math.max(now.min, now.value + direction * now.step))
    if (next === now.value) return false
    latest.current = { ...now, value: next }
    now.onChange(next)
    return true
  }, [])

  return useMemo<StepperHandlers>(
    () => ({
      press(direction) {
        if (repeated.current) {
          repeated.current = false
          return
        }
        move(direction)
      },
      holdProps(direction) {
        const tick = () => {
          repeated.current = true
          timer.current = move(direction) ? setTimeout(tick, HOLD_REPEAT_MS) : null
        }
        return {
          onPointerDown(event) {
            if (event.button !== 0) return
            repeated.current = false
            stop()
            timer.current = setTimeout(tick, HOLD_DELAY_MS)
          },
          onPointerUp: stop,
          onPointerLeave: stop,
          onPointerCancel: stop,
        }
      },
      onKeyDown(event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowRight') move(1)
        else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') move(-1)
        else return
        event.preventDefault()
      },
    }),
    [move, stop],
  )
}
