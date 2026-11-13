import { DIAL_SIZE, TICK_DASH, TRACK_PATH, dialPoint, targetNotchPath } from './dialGeometry'

interface DialProps {
  /** Target angle: draws the thin notch on the rim (screen 07). */
  target?: number
  /** Live angle: draws the round marker on the ring at that angle (screen 03). */
  marker?: number
}

/**
 * The ring of the Marea dial (handoff 03): a 8 px track with a tick every 10 degrees, plus the
 * optional target notch and live marker. Decoration only: the angle is always also written as
 * text beside it. The water, the pain arc and the progress arc belong to the session phase.
 */
export function Dial({ target, marker }: DialProps) {
  const point = marker === undefined ? null : dialPoint(marker)
  return (
    <svg
      viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
      width={DIAL_SIZE}
      height={DIAL_SIZE}
      fill="none"
      aria-hidden="true"
      data-part="dial"
      style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
    >
      <path d={TRACK_PATH} stroke="var(--af-marea-line)" strokeWidth="8" strokeLinecap="round" />
      <path
        d={TRACK_PATH}
        stroke="var(--af-marea-ink)"
        strokeWidth="16"
        strokeDasharray={TICK_DASH}
        opacity=".22"
      />
      {target === undefined ? null : (
        <path
          d={targetNotchPath(target)}
          stroke="var(--af-marea-ink)"
          strokeWidth="4"
          strokeLinecap="round"
          data-part="dial-notch"
        />
      )}
      {point ? (
        <circle
          cx={point.x}
          cy={point.y}
          r="10"
          fill="var(--af-marea-mint)"
          stroke="var(--af-marea-paper)"
          strokeWidth="4"
          data-part="dial-marker"
        />
      ) : null}
    </svg>
  )
}
