import { computeAngle } from '../domain/angle'
import type { AngleCalibration } from '../domain/angle'
import { filterAngle } from '../domain/filter'
import { calibrate } from './calibration'
import type { CalibrationOptions, CalibrationResult } from './calibration'
import { NO_DATA_TIMEOUT_MS } from './constants'
import type { AngleSource, PermissionResult, SensorMode, Vec3 } from './types'

export type TrackerStatus =
  'idle' | 'denied' | 'unsupported' | 'waiting' | 'no-data' | 'uncalibrated' | 'live' | 'paused'

export interface AngleSnapshot {
  readonly angle: number | null
  readonly status: TrackerStatus
}

export interface AngleTracker {
  readonly mode: SensorMode
  getSnapshot(): AngleSnapshot
  subscribe(listener: () => void): () => void
  requestPermission(): Promise<PermissionResult>
  start(): void
  stop(): void
  pause(): void
  resume(): void
  setCalibration(calibration: AngleCalibration | null): void
  calibrate(options?: CalibrationOptions): Promise<CalibrationResult>
}

export function createAngleTracker(source: AngleSource): AngleTracker {
  const listeners = new Set<() => void>()
  let snapshot: AngleSnapshot = { angle: null, status: 'idle' }

  let permission: PermissionResult | null = null
  let calibration: AngleCalibration | null = null
  let running = false
  let paused = false
  let noData = false
  let lastSample: Vec3 | null = null
  let angle: number | null = null
  let noDataTimer: ReturnType<typeof setTimeout> | undefined

  const deriveStatus = (): TrackerStatus => {
    if (permission === 'denied') return 'denied'
    if (permission === 'unsupported') return 'unsupported'
    if (paused) return 'paused'
    if (!running) return 'idle'
    if (noData) return 'no-data'
    if (lastSample === null) return 'waiting'
    if (calibration === null) return 'uncalibrated'
    return angle === null ? 'waiting' : 'live'
  }

  const publish = (): void => {
    const status = deriveStatus()
    if (status === snapshot.status && angle === snapshot.angle) return
    snapshot = { angle, status }
    for (const listener of listeners) listener()
  }

  const recompute = (): void => {
    if (!calibration || !lastSample) return
    const raw = computeAngle(lastSample, calibration)
    if (raw !== null) angle = filterAngle(angle, raw)
  }

  const armNoDataTimer = (): void => {
    clearTimeout(noDataTimer)
    noDataTimer = setTimeout(() => {
      if (running && lastSample === null) {
        noData = true
        publish()
      }
    }, NO_DATA_TIMEOUT_MS)
  }

  source.onSample((sample) => {
    if (!running) return
    lastSample = sample
    noData = false
    clearTimeout(noDataTimer)
    recompute()
    publish()
  })

  const begin = (): void => {
    running = true
    paused = false
    noData = false
    lastSample = null
    angle = null
    source.start()
    armNoDataTimer()
  }

  const end = (): void => {
    running = false
    clearTimeout(noDataTimer)
    source.stop()
  }

  return {
    mode: source.mode,
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async requestPermission() {
      permission = await source.requestPermission()
      if (permission === 'granted') permission = null
      publish()
      return permission ?? 'granted'
    },
    start() {
      if (running || permission === 'denied' || permission === 'unsupported') return
      begin()
      publish()
    },
    stop() {
      end()
      paused = false
      lastSample = null
      angle = null
      noData = false
      publish()
    },
    pause() {
      if (!running) return
      end()
      paused = true
      publish()
    },
    resume() {
      if (!paused) return
      begin()
      publish()
    },
    setCalibration(next) {
      calibration = next
      angle = null
      recompute()
      publish()
    },
    async calibrate(options) {
      if (!running) {
        if (permission === 'denied' || permission === 'unsupported') {
          return { ok: false, reason: 'no-data' }
        }
        begin()
        publish()
      }
      const result = await calibrate(source, options)
      if (result.ok) {
        calibration = { gravityRef: result.gravityRef }
        angle = null
        recompute()
        publish()
      }
      return result
    },
  }
}
