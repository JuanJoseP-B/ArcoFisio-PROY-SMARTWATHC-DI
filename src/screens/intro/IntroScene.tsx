import { memo, useId } from 'react'
import { color, geometry, sceneColor } from '../../design/tokens'
import { BeadPattern } from '../../ui/BeadPattern'
import type { IntroFrame } from './frame'
import { INTRO_RING_DASH } from './frame'

const SIZE = geometry.screenSize
const CENTER = SIZE / 2
const RING_RADIUS = 170

const GRASS_TONES = [color.bronze, sceneColor.hillNear, sceneColor.hillFar] as const

const FeatherLong = ({ transform }: { transform: string }) => (
  <g transform={transform}>
    <path
      d="M0 -8 Q-7 -30 0 -56 Q7 -30 0 -8 Z"
      fill={sceneColor.feather}
      stroke={sceneColor.featherTip}
      strokeWidth="0.8"
    />
    <path d="M-4.5 -46 Q0 -62 4.5 -46 Q0 -51 -4.5 -46 Z" fill={sceneColor.featherTip} />
    <line x1="0" y1="-8" x2="0" y2="-18" stroke={color.terracotta} strokeWidth="3" />
  </g>
)

const FeatherShort = ({ transform }: { transform: string }) => (
  <g transform={transform}>
    <path
      d="M0 -6 Q-6 -24 0 -44 Q6 -24 0 -6 Z"
      fill={sceneColor.feather}
      stroke={sceneColor.featherTip}
      strokeWidth="0.8"
    />
    <path d="M-3.5 -36 Q0 -48 3.5 -36 Q0 -40 -3.5 -36 Z" fill={sceneColor.featherTip} />
  </g>
)

/** Everything of the archer that sits behind the bow string and the drawing arm. */
const ArcherBack = memo(function ArcherBack() {
  return (
    <>
      <path d="M144 122 Q130 160 132 214 L142 214 Q142 170 154 134 Z" fill={sceneColor.hair} />
      <path
        d="M156 216 L172 258 L186 296 M148 216 L134 258 L120 296"
        fill="none"
        stroke={sceneColor.buckskinShade}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M136 150 Q152 143 168 150 L174 224 L132 224 Z" fill={sceneColor.buckskin} />
      <path
        d="M134 230 L136 240 M142 230 L143 242 M150 230 L150 242 M158 230 L157 242 M166 230 L165 240 M172 228 L172 238"
        stroke={sceneColor.buckskinShade}
        strokeWidth="2"
      />
      <BeadPattern x={134} y={196} width={40} height={7} opacity={1} />
      <path d="M134 150 Q148 145 160 150 L152 234 L126 240 Z" fill={sceneColor.blanket} />
      <path d="M131 196 L156 192" stroke={color.gold} strokeWidth="4" />
      <path
        d="M164 156 L198 148"
        stroke={sceneColor.buckskin}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M176 160 L178 168 M184 158 L186 166 M192 156 L194 164"
        stroke={sceneColor.buckskinShade}
        strokeWidth="1.5"
      />
      <path d="M198 148 L232 140" stroke={sceneColor.skin} strokeWidth="8" strokeLinecap="round" />
      <path
        d="M224 78 Q264 140 224 202"
        fill="none"
        stroke={sceneColor.wood}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="238" y="132" width="8" height="16" rx="3" fill={color.gold} />
    </>
  )
})

/** Head, headband and braid, drawn over the drawing arm. */
const ArcherHead = memo(function ArcherHead() {
  return (
    <>
      <circle cx="154" cy="128" r="15" fill={sceneColor.skin} />
      <path d="M167 124 L173 131 L167 134 Z" fill={sceneColor.skin} />
      <path d="M146 116 Q154 110 164 116 L162 122 Q152 118 144 122 Z" fill={sceneColor.hair} />
      <BeadPattern x={139} y={118} width={29} height={6} opacity={1} />
      <path
        d="M160 140 Q162 160 158 182"
        stroke={sceneColor.hair}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  )
})

const Arrow = () => (
  <>
    <line
      x1="0"
      y1="140"
      x2="96"
      y2="140"
      stroke={sceneColor.featherTip}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M104 140 L92 133 L95 140 L92 147 Z" fill={sceneColor.featherTip} />
    <path
      d="M2 140 L-6 133 M2 140 L-6 147 M8 140 L0 133 M8 140 L0 147"
      stroke={color.terracotta}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </>
)

const Archer = ({ frame }: { frame: IntroFrame }) => (
  <g transform={`translate(${frame.manX.toFixed(1)} 0)`} opacity={frame.manOpacity.toFixed(2)}>
    {frame.trail.map((transform, i) => (
      <FeatherShort key={i} transform={transform} />
    ))}
    {frame.fan.map((transform, i) => (
      <FeatherLong key={i} transform={transform} />
    ))}
    <ArcherBack />
    <path
      d={`M224 78 L ${frame.nockX.toFixed(1)} 140 L 224 202`}
      fill="none"
      stroke={sceneColor.feather}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d={`M158 156 L ${frame.elbowX.toFixed(1)} ${frame.elbowY.toFixed(1)} L ${frame.nockX.toFixed(1)} 140`}
      fill="none"
      stroke={sceneColor.skin}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <ArcherHead />
  </g>
)

interface IntroSceneProps {
  frame: IntroFrame
}

/** The 384 x 384 illustration of sheet 01: prairie, archer, iris and brand ring. */
export function IntroScene({ frame }: IntroSceneProps) {
  const skyId = `intro-sky-${useId().replace(/:/g, '')}`

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-part="intro-scene"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sceneColor.skyTop} />
          <stop offset="0.55" stopColor={sceneColor.skyMid} />
          <stop offset="1" stopColor={sceneColor.skyBottom} />
        </linearGradient>
      </defs>
      <g opacity={frame.sceneOpacity.toFixed(2)}>
        <rect x="0" y="0" width={SIZE} height={SIZE} fill={`url(#${skyId})`} />
        <circle
          cx="262"
          cy={frame.sunY.toFixed(1)}
          r="86"
          fill={sceneColor.sunHalo}
          opacity="0.35"
        />
        <circle cx="262" cy={frame.sunY.toFixed(1)} r="58" fill={sceneColor.sun} />
        <path
          d="M0 268 Q60 226 120 258 Q190 212 260 252 Q320 228 384 246 L384 384 L0 384 Z"
          fill={sceneColor.hillFar}
          opacity="0.55"
        />
        <path
          d="M0 292 Q100 270 200 290 Q300 276 384 288 L384 384 L0 384 Z"
          fill={sceneColor.hillNear}
        />
        <Archer frame={frame} />
        <g
          opacity={frame.arrowOpacity.toFixed(2)}
          transform={`translate(${frame.arrowX.toFixed(1)} ${frame.arrowY.toFixed(1)})`}
        >
          <Arrow />
        </g>
        <g transform={frame.floatTransform} opacity={frame.floatOpacity.toFixed(2)}>
          <path
            d="M0 -8 Q-7 -30 0 -56 Q7 -30 0 -8 Z"
            fill={sceneColor.feather}
            stroke={sceneColor.featherTip}
            strokeWidth="0.8"
          />
          <path d="M-4.5 -46 Q0 -62 4.5 -46 Q0 -51 -4.5 -46 Z" fill={sceneColor.featherTip} />
        </g>
        {frame.grass.map((blade, i) => (
          <path
            key={i}
            d={blade.d}
            stroke={GRASS_TONES[blade.tone]}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={CENTER} cy={CENTER} r={frame.irisRadius.toFixed(1)} fill={color.ink} />
      <g opacity={frame.ringOpacity.toFixed(2)}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={color.primarySoft}
          strokeWidth="10"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          fill="none"
          stroke={color.gold}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={INTRO_RING_DASH}
          strokeDashoffset={frame.ringDashOffset.toFixed(1)}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
        <BeadPattern x={92} y={262} width={200} height={16} opacity={0.9} />
      </g>
    </svg>
  )
}
