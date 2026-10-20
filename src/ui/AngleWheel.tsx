import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { ANGLE_MAX_DEG, ANGLE_MIN_DEG } from '../domain/constants'
import { WHEEL_STEP_DEG, dragValue, pointerDirection, snapAngle, stepAngle } from '../domain/wheel'
import { geometry } from '../design/tokens'
import styles from './AngleWheel.module.css'
import { WHEEL_CENTER, wheelLabels, wheelRotation, wheelTicks } from './wheelGeometry'

interface AngleWheelProps {
  /** Chosen angle in degrees; the wheel shows the nearest detent. */
  value: number
  onChange(value: number): void
  /** Already translated: what the wheel sets, e.g. "Ángulo objetivo". Also its accessible name. */
  title: string
  /** Already translated line under the number, e.g. "Detenciones cada 5°". */
  caption: string
}

const SIZE = geometry.screenSize
const TICKS = wheelTicks()
const LABELS = wheelLabels()

const KEY_STEPS: Record<string, number> = {
  ArrowUp: 1,
  ArrowRight: 1,
  ArrowDown: -1,
  ArrowLeft: -1,
  PageUp: 6,
  PageDown: -6,
}

/**
 * Sheet 03: a rim of 72 marks that turns against the value, with the arrow fixed at the top.
 * Drag the rim like a dial, scroll over it, or use the arrow keys (PageUp/PageDown jump 30°,
 * Home/End go to the ends). It clicks into place every 5°.
 */
export function AngleWheel({ value, onChange, title, caption }: AngleWheelProps) {
  const root = useRef<HTMLDivElement>(null)
  const current = snapAngle(value)
  const latest = useRef({ current, onChange })

  useEffect(() => {
    latest.current = { current, onChange }
  })

  useEffect(() => {
    const element = root.current
    if (!element) return undefined

    let drag: { pointer: number; start: number; id: number } | null = null
    const direction = (event: PointerEvent): number => {
      const box = element.getBoundingClientRect()
      return pointerDirection(
        box.left + box.width / 2,
        box.top + box.height / 2,
        event.clientX,
        event.clientY,
      )
    }
    const set = (next: number) => {
      if (next !== latest.current.current) latest.current.onChange(next)
    }

    const onDown = (event: PointerEvent) => {
      drag = { pointer: direction(event), start: latest.current.current, id: event.pointerId }
      element.setPointerCapture?.(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return
      set(dragValue(drag.start, drag.pointer, direction(event)))
    }
    const onEnd = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return
      drag = null
      // Turning the dial is not a "go back" swipe, so the screen never hears this release.
      event.stopPropagation()
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      set(stepAngle(latest.current.current, event.deltaY < 0 ? 1 : -1))
    }

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerup', onEnd)
    element.addEventListener('pointercancel', onEnd)
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onEnd)
      element.removeEventListener('pointercancel', onEnd)
      element.removeEventListener('wheel', onWheel)
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent) => {
    let next: number | null = null
    const steps = KEY_STEPS[event.key]
    if (steps !== undefined) next = stepAngle(current, steps)
    else if (event.key === 'Home') next = ANGLE_MIN_DEG
    else if (event.key === 'End') next = ANGLE_MAX_DEG
    if (next === null) return
    event.preventDefault()
    if (next !== current) onChange(next)
  }

  return (
    <div
      ref={root}
      className={styles.wheel}
      role="slider"
      tabIndex={0}
      aria-label={title}
      aria-orientation="horizontal"
      aria-valuemin={ANGLE_MIN_DEG}
      aria-valuemax={ANGLE_MAX_DEG}
      aria-valuenow={current}
      aria-valuetext={`${current}°`}
      data-part="angle-wheel"
      data-step={WHEEL_STEP_DEG}
      onKeyDown={onKeyDown}
    >
      <svg
        className={styles.layer}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle className={styles.rim} cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="158" />
        <g
          className={styles.dial}
          style={{ transform: `rotate(${wheelRotation(current)}deg)` }}
          data-part="wheel-dial"
        >
          {TICKS.map((tick) => (
            <line
              key={tick.angle}
              className={tick.major ? styles.tickMajor : styles.tick}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
            />
          ))}
          {LABELS.map((label) => (
            <text
              key={label.angle}
              className={styles.label}
              x={label.x}
              y={label.y}
              transform={`rotate(${label.angle} ${label.x} ${label.y})`}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {`${label.angle}°`}
            </text>
          ))}
        </g>
        <g className={styles.nock} data-part="wheel-nock">
          <line className={styles.nockShaft} x1="192" y1="2" x2="192" y2="30" />
          <path className={styles.nockHead} d="M 192 46 L 182 26 L 192 31 L 202 26 Z" />
        </g>
      </svg>
      <div className={styles.readout}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value} data-part="wheel-value">
          {current}°
        </div>
        <div className={styles.caption}>{caption}</div>
      </div>
    </div>
  )
}
