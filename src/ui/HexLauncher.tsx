import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import styles from './HexLauncher.module.css'
import { HEX_CELLS, HEX_HEIGHT, HEX_WIDTH, layoutFor, moveFocus } from './hexLayout'
import type { Direction, LauncherId } from './hexLayout'

interface HexLauncherProps {
  /** Group label for assistive tech (already translated). */
  label: string
  /** Translated name of each app; shown on the cell and read by screen readers. */
  names: Readonly<Record<LauncherId, string>>
  onSelect(id: LauncherId): void
}

const ARROWS: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

// Outline of the hexagon, drawn a stroke-width in so it is not cut at the edge.
const RING_POINTS = `${HEX_WIDTH / 2},2 ${HEX_WIDTH - 2},${HEX_HEIGHT * 0.25} ${HEX_WIDTH - 2},${HEX_HEIGHT * 0.75} ${HEX_WIDTH / 2},${HEX_HEIGHT - 2} 2,${HEX_HEIGHT * 0.75} 2,${HEX_HEIGHT * 0.25}`

/**
 * Sheet 08: seven hexagonal cells in a honeycomb. The focused cell swells and turns green, the
 * others shrink with distance. Focus follows touch, pointer and the arrow keys; Tab walks the
 * cells in spec order, and Enter or a tap opens one.
 */
export function HexLauncher({ label, names, onSelect }: HexLauncherProps) {
  const [focused, setFocused] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const direction = ARROWS[event.key]
    if (!direction) return
    event.preventDefault()
    const next = moveFocus(index, direction)
    setFocused(next)
    buttons.current[next]?.focus()
  }

  return (
    <div className={styles.launcher} role="group" aria-label={label} data-part="hex-launcher">
      {layoutFor(focused).map((cell, index) => (
        <button
          key={cell.id}
          ref={(node) => {
            buttons.current[index] = node
          }}
          type="button"
          className={styles.cell}
          style={{
            left: cell.x,
            top: cell.y,
            transform: `scale(${cell.scale})`,
            zIndex: cell.z,
          }}
          data-cell={cell.id}
          data-focused={cell.focused}
          aria-label={names[cell.id]}
          onFocus={() => setFocused(index)}
          onPointerEnter={() => setFocused(index)}
          onPointerDown={() => setFocused(index)}
          onKeyDown={(event) => onKeyDown(event, index)}
          onClick={() => onSelect(cell.id)}
        >
          <span className={styles.hex}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={HEX_CELLS[index]?.icon} />
            </svg>
            <span className={styles.label}>{names[cell.id]}</span>
          </span>
          <svg
            className={styles.ring}
            width={HEX_WIDTH}
            height={HEX_HEIGHT}
            viewBox={`0 0 ${HEX_WIDTH} ${HEX_HEIGHT}`}
            aria-hidden="true"
            data-part="focus-ring"
          >
            <polygon points={RING_POINTS} />
          </svg>
        </button>
      ))}
    </div>
  )
}
