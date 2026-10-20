import type { PainArc, Zone } from '../domain/zones'
import { geometry } from '../design/tokens'
import styles from './GoniometerRing.module.css'
import {
  RING_CENTER,
  RING_TOP_Y,
  clampAngle,
  painBandGeometry,
  ringGeometry,
  targetRadius,
} from './ringGeometry'

interface GoniometerRingProps {
  /** Live angle in degrees; the arc fills `angle / 360` of the ring from the top, clockwise. */
  angle: number
  target: number
  /** Drives the arc color and the size of the target marker. */
  zone?: Zone | null
  /** The saved painful arc: a pulsing band behind the ring, marked at both ends. */
  painArc?: PainArc | null
}

const SIZE = geometry.screenSize

/** Sheet 02: ring, dotted string, target marker and the knob that follows the angle. */
export function GoniometerRing({
  angle,
  target,
  zone = null,
  painArc = null,
}: GoniometerRingProps) {
  const a = clampAngle(angle)
  const { dashOffset, tipX, tipY, stringOpacity } = ringGeometry(a)
  const rotate = (degrees: number) => `rotate(${degrees.toFixed(2)} ${RING_CENTER} ${RING_CENTER})`
  const band = painArc ? painBandGeometry(painArc, a) : null
  const ringTransform = `rotate(-90 ${RING_CENTER} ${RING_CENTER})`

  return (
    <svg
      className={styles.ring}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-part="goniometer-ring"
      data-zone={zone ?? undefined}
    >
      {band ? (
        <circle
          className={styles.band}
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={geometry.ringRadius}
          strokeDasharray={band.dashArray}
          strokeDashoffset={band.dashOffset.toFixed(2)}
          transform={ringTransform}
          data-part="pain-band"
        />
      ) : null}
      <circle className={styles.track} cx={RING_CENTER} cy={RING_CENTER} r={geometry.ringRadius} />
      <circle
        className={styles.halo}
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={geometry.ringRadius}
        data-part="halo"
      />
      <circle
        className={styles.arc}
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={geometry.ringRadius}
        strokeDasharray={geometry.ringCircumference}
        strokeDashoffset={dashOffset.toFixed(2)}
        transform={ringTransform}
        data-part="arc"
      />
      {painArc && band && band.reached > 0 ? (
        <circle
          className={styles.painReach}
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={geometry.ringRadius}
          strokeDasharray={`${((band.reached * geometry.ringCircumference) / 360).toFixed(2)} ${geometry.ringCircumference}`}
          strokeDashoffset={band.dashOffset.toFixed(2)}
          transform={ringTransform}
          data-part="pain-reach"
        />
      ) : null}
      {painArc
        ? [painArc.from, painArc.to].map((edge) => (
            <g key={edge} transform={rotate(clampAngle(edge))} data-part="pain-edge">
              <line
                className={styles.painEdge}
                x1={RING_CENTER}
                y1={RING_TOP_Y - 18}
                x2={RING_CENTER}
                y2={RING_TOP_Y + 18}
              />
            </g>
          ))
        : null}
      <line
        className={styles.string}
        x1={RING_CENTER}
        y1={RING_TOP_Y}
        x2={tipX.toFixed(2)}
        y2={tipY.toFixed(2)}
        opacity={stringOpacity}
        data-part="string"
      />
      <g transform={rotate(target)} data-part="target">
        <circle className={styles.target} cx={RING_CENTER} cy={RING_TOP_Y} r={targetRadius(zone)} />
        <circle className={styles.targetDot} cx={RING_CENTER} cy={RING_TOP_Y} r="3.5" />
      </g>
      <g transform={rotate(a)} data-part="knob">
        <g className={styles.tremor}>
          <circle className={styles.knob} cx={RING_CENTER} cy={RING_TOP_Y} r="12" />
          <path
            className={styles.chevron}
            d={`M ${RING_CENTER - 3} ${RING_TOP_Y - 5} L ${RING_CENTER + 3} ${RING_TOP_Y} L ${RING_CENTER - 3} ${RING_TOP_Y + 5}`}
          />
        </g>
      </g>
    </svg>
  )
}
