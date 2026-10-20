export interface AngleSink {
  setAngle(angle: number): void
}

export interface FrameScheduler {
  request(callback: (time: number) => void): number
  cancel(handle: number): void
}

export interface SweepOptions {
  min?: number
  max?: number
  periodMs?: number
  scheduler?: FrameScheduler
}

const browserScheduler: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle),
}

export function triangleAngle(
  elapsedMs: number,
  min: number,
  max: number,
  periodMs: number,
): number {
  const phase = (((elapsedMs % periodMs) + periodMs) % periodMs) / periodMs
  const ratio = phase < 0.5 ? phase * 2 : (1 - phase) * 2
  return min + (max - min) * ratio
}

/** Drives a simulated source up and down between min and max; returns a stop function. */
export function startSweep(sink: AngleSink, options: SweepOptions = {}): () => void {
  const { min = 0, max = 150, periodMs = 8000, scheduler = browserScheduler } = options
  let origin: number | null = null
  let handle = 0
  let active = true

  const frame = (time: number): void => {
    if (!active) return
    origin ??= time
    sink.setAngle(triangleAngle(time - origin, min, max, periodMs))
    handle = scheduler.request(frame)
  }

  handle = scheduler.request(frame)
  return () => {
    active = false
    scheduler.cancel(handle)
  }
}
