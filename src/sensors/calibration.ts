import type { Calibration } from '../data/types'
import { dot, normalize } from '../domain/vector'
import {
  CALIBRATION_MAX_SPREAD_DEG,
  CALIBRATION_MIN_SAMPLES,
  CALIBRATION_TIMEOUT_MS,
} from './constants'
import type { AngleSource, SensorMode, Vec3 } from './types'

export type CalibrationFailure = 'no-data' | 'unstable'

export type CalibrationResult =
  { ok: true; gravityRef: Vec3 } | { ok: false; reason: CalibrationFailure }

export interface CalibrationOptions {
  minSamples?: number
  maxSpreadDeg?: number
  timeoutMs?: number
}

const RAD_TO_DEG = 180 / Math.PI

/** Mean direction of the samples, rejected if any of them strays too far from it. */
export function averageGravity(
  samples: readonly Vec3[],
  minSamples = CALIBRATION_MIN_SAMPLES,
  maxSpreadDeg = CALIBRATION_MAX_SPREAD_DEG,
): CalibrationResult {
  const directions = samples.flatMap((sample) => {
    const unit = normalize(sample)
    return unit ? [unit] : []
  })
  if (directions.length < minSamples) return { ok: false, reason: 'no-data' }

  const sum = directions.reduce<Vec3>(
    (acc, v) => [acc[0] + v[0], acc[1] + v[1], acc[2] + v[2]],
    [0, 0, 0],
  )
  const mean = normalize(sum)
  if (!mean) return { ok: false, reason: 'unstable' }

  const widest = Math.max(
    ...directions.map((v) => Math.acos(Math.max(-1, Math.min(1, dot(v, mean)))) * RAD_TO_DEG),
  )
  if (widest > maxSpreadDeg) return { ok: false, reason: 'unstable' }

  return { ok: true, gravityRef: mean }
}

/** Gathers up to `count` samples, resolving early on the count or with what arrived on timeout. */
export function collectSamples(
  source: AngleSource,
  count: number,
  timeoutMs: number,
): Promise<Vec3[]> {
  return new Promise((resolve) => {
    const samples: Vec3[] = []
    const finish = (): void => {
      clearTimeout(timer)
      unsubscribe()
      resolve(samples)
    }
    const unsubscribe = source.onSample((sample) => {
      samples.push(sample)
      if (samples.length >= count) finish()
    })
    const timer = setTimeout(finish, timeoutMs)
  })
}

/** Arm hanging: reads the running source and returns the reference gravity. */
export async function calibrate(
  source: AngleSource,
  options: CalibrationOptions = {},
): Promise<CalibrationResult> {
  const {
    minSamples = CALIBRATION_MIN_SAMPLES,
    maxSpreadDeg = CALIBRATION_MAX_SPREAD_DEG,
    timeoutMs = CALIBRATION_TIMEOUT_MS,
  } = options
  const samples = await collectSamples(source, minSamples, timeoutMs)
  return averageGravity(samples, minSamples, maxSpreadDeg)
}

export function toCalibration(gravityRef: Vec3, mode: SensorMode, now = new Date()): Calibration {
  return { gravityRef, calibratedAt: now.toISOString(), sensorMode: mode }
}
