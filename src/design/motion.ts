export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t

/** Progress of `p` through the window [start, end], clamped to 0..1. */
export const ramp = (p: number, start: number, end: number): number =>
  clamp01((p - start) / (end - start))

export const easeInOutCubic = (x: number): number => {
  const t = clamp01(x)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3)

export const smoothstep = (x: number): number => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

/**
 * Same curve as CSS `cubic-bezier(x1, y1, x2, y2)`, for values driven from
 * requestAnimationFrame that must match the CSS-timed parts of a screen.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const sample = (a: number, b: number, s: number) =>
    3 * a * s * (1 - s) * (1 - s) + 3 * b * s * s * (1 - s) + s * s * s
  const slope = (a: number, b: number, s: number) =>
    3 * a * (1 - s) * (1 - s) + 6 * (b - a) * s * (1 - s) + 3 * (1 - b) * s * s

  return (t) => {
    const x = clamp01(t)
    let s = x
    for (let i = 0; i < 8; i += 1) {
      const dx = sample(x1, x2, s) - x
      const d = slope(x1, x2, s)
      if (Math.abs(dx) < 1e-6 || Math.abs(d) < 1e-6) break
      s -= dx / d
    }
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24 && Math.abs(sample(x1, x2, s) - x) > 1e-6; i += 1) {
      if (sample(x1, x2, s) < x) lo = s
      else hi = s
      s = (lo + hi) / 2
    }
    return sample(y1, y2, clamp01(s))
  }
}
