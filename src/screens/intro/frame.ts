import { easeInOutCubic, easeOutCubic, ramp } from '../../design/motion'

/** One full loop of the intro (sheet 01). */
export const INTRO_PERIOD_MS = 9000

/** Loop position whose frame shows the finished brand lockup; used for reduced motion. */
export const INTRO_BRAND_PROGRESS = 0.85

export const INTRO_RING_DASH = 1068

export interface GrassBlade {
  d: string
  /** 0..2, picks one of the three grass tones. */
  tone: number
}

export interface IntroFrame {
  fan: string[]
  trail: string[]
  grass: GrassBlade[]
  sceneOpacity: number
  sunY: number
  manX: number
  manOpacity: number
  /** Bow string pull point x (224 relaxed, 172 fully drawn). */
  nockX: number
  elbowX: number
  elbowY: number
  arrowX: number
  arrowY: number
  arrowOpacity: number
  floatTransform: string
  floatOpacity: number
  irisRadius: number
  ringOpacity: number
  ringDashOffset: number
  wordmarkOpacity: number
  wordmarkShift: number
}

const f1 = (n: number): string => n.toFixed(1)

/** Frame of the intro at `ms` since it started. Port of the sheet's renderVals(). */
export function introFrame(ms: number): IntroFrame {
  const p = (ms % INTRO_PERIOD_MS) / INTRO_PERIOD_MS
  const s = ms / 1000
  const R = (a: number, b: number) => ramp(p, a, b)

  const fan: string[] = []
  for (let i = 0; i < 13; i += 1) {
    const th = 12 - i * 13 + Math.sin(s * 2.2 + i * 0.6) * 2.5
    fan.push(`translate(150 124) rotate(${f1(th)})`)
  }

  const trail: string[] = []
  for (let i = 0; i < 7; i += 1) {
    const th = -128 + Math.sin(s * 2 + i) * 4
    trail.push(`translate(${134 - i * 1.5} ${150 + i * 16}) rotate(${f1(th)}) scale(.8)`)
  }

  const grass: GrassBlade[] = []
  for (let i = 0; i < 46; i += 1) {
    const x = i * 8.6 + (i % 2) * 3
    const h = 52 + ((i * 37) % 44)
    const sway = Math.sin(s * 1.8 + i * 0.45) * 7 + 3
    grass.push({
      d: `M${f1(x)} 392 Q${f1(x + sway / 2)} ${f1(392 - h / 2)} ${f1(x + sway)} ${384 - h}`,
      tone: i % 3,
    })
  }

  // Bow draw (22-42 %), then the release shake (46-54 %).
  let draw = easeInOutCubic(R(0.22, 0.42))
  if (p >= 0.46) {
    const q = R(0.46, 0.54)
    draw = q < 1 ? Math.sin(q * 26) * 0.12 * (1 - q) : 0
  }
  const bend = Math.max(draw, 0)
  const nockX = 224 - 52 * draw

  let arrowX = nockX
  let arrowY = 0
  let arrowOpacity = R(0.14, 0.2)
  if (p >= 0.46) {
    const q = R(0.46, 0.52)
    arrowX = 172 + 440 * q * q
    arrowY = -70 * q
    arrowOpacity = q < 1 ? 1 : 0
  }

  const fq = R(0.46, 0.66)
  const floatTransform = `translate(${f1(150 + 110 * fq)} ${f1(110 - 30 * Math.sin(fq * 3))}) rotate(${f1(-40 + 220 * fq)})`

  const manIn = easeOutCubic(R(0.05, 0.18))
  const fadeOut = 1 - R(0.94, 1)

  return {
    fan,
    trail,
    grass,
    sceneOpacity: R(0, 0.07),
    sunY: 230 - 70 * easeOutCubic(R(0, 0.18)),
    manX: -40 * (1 - manIn),
    manOpacity: manIn,
    nockX,
    elbowX: 186 - 58 * bend,
    elbowY: 160 - 14 * bend,
    arrowX,
    arrowY,
    arrowOpacity,
    floatTransform,
    floatOpacity: p >= 0.46 && fq < 1 ? 1 - fq * 0.3 : 0,
    irisRadius: 290 * easeInOutCubic(R(0.56, 0.66)) * fadeOut,
    ringOpacity: R(0.62, 0.66) * fadeOut,
    ringDashOffset: INTRO_RING_DASH * (1 - easeOutCubic(R(0.63, 0.8))),
    wordmarkOpacity: R(0.66, 0.76) * fadeOut,
    wordmarkShift: 14 * (1 - easeOutCubic(R(0.66, 0.78))),
  }
}
