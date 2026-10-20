import { color, geometry, sceneColor } from '../design/tokens'

const SIZE = geometry.screenSize
const BASE = SIZE / 2
const ANGLES = [-64, -48, -32, -16, 0, 16, 32, 48, 64] as const

/** Faint fan of nine feathers behind the goniometer (sheet 02 background). */
export function FeatherFan() {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-part="feather-fan"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <g opacity="0.11">
        {ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle} ${BASE} ${SIZE})`}>
            <path d="M192 384 Q174 250 192 96 Q210 250 192 384 Z" fill={color.bronze} />
            <path d="M192 384 L192 110" stroke={color.screenBase} strokeWidth="1.5" />
            <path d="M183 140 Q192 112 201 140 Q192 128 183 140 Z" fill={sceneColor.featherTip} />
          </g>
        ))}
      </g>
    </svg>
  )
}
