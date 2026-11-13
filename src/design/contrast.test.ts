import { describe, expect, it } from 'vitest'
import { contrastRatio, luminance, mixHex } from './contrast'
import { color, geometry, mareaColor as m, mareaGeometry } from './tokens'

const MIN_TEXT = 4.5

describe('contrast helpers', () => {
  it('knows the extremes', () => {
    expect(luminance('#000000')).toBe(0)
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5)
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBe(1)
  })

  it('does not depend on the order of the colors', () => {
    expect(contrastRatio('#1F3A2B', '#F6EBD9')).toBe(contrastRatio('#F6EBD9', '#1F3A2B'))
  })

  it('mixes two colors', () => {
    expect(mixHex('#000000', '#FFFFFF', 0)).toBe('#000000')
    expect(mixHex('#000000', '#FFFFFF', 1)).toBe('#FFFFFF')
    expect(mixHex('#000000', '#FFFFFF', 0.5)).toBe('#808080')
  })
})

/**
 * The screen is a radial gradient centered at 50% 38%. Text stays inside the safe circle, whose
 * farthest point from that center sits about 69% of the way to the outer color. Checking there
 * covers every place a line of text can land.
 */
const FARTHEST_GRADIENT_SHARE = 0.69
const edge = mixHex(color.screenGradientInner, color.screenGradientOuter, FARTHEST_GRADIENT_SHARE)

describe('text on the screen', () => {
  const backgrounds = {
    'the middle of the screen': color.screenGradientInner,
    'the edge of the safe circle': edge,
    'a raised card': color.surfaceRaised,
    'a pill or card surface': color.surface,
  }
  const inks = {
    ink: color.ink,
    inkMuted: color.inkMuted,
    bronze: color.bronze,
    primarySoft: color.primarySoft,
    zoneOptimal: color.zoneOptimal,
    zoneCaution: color.zoneCaution,
    zonePain: color.zonePain,
    zoneRest: color.zoneRest,
  }

  for (const [inkName, ink] of Object.entries(inks)) {
    for (const [bgName, bg] of Object.entries(backgrounds)) {
      // The surface pill color only holds dark text (labels on bone-colored buttons).
      if (bgName === 'a pill or card surface' && inkName.startsWith('zone')) continue
      it(`${inkName} reaches ${MIN_TEXT}:1 on ${bgName}`, () => {
        expect(contrastRatio(ink, bg)).toBeGreaterThanOrEqual(MIN_TEXT)
      })
    }
  }
})

describe('text inside filled shapes', () => {
  it('reads on the primary buttons', () => {
    expect(contrastRatio(color.inkOnPrimary, color.ink)).toBeGreaterThanOrEqual(MIN_TEXT)
    expect(contrastRatio(color.inkOnPrimary, color.primarySoft)).toBeGreaterThanOrEqual(MIN_TEXT)
  })

  it('reads on each zone chip', () => {
    const chips = [
      [color.zoneOptimal, color.zoneOptimalTint],
      [color.zoneCaution, color.zoneCautionTint],
      [color.zonePain, color.zonePainTint],
      [color.zoneRest, color.zoneRestTint],
    ] as const
    for (const [ink, tint] of chips)
      expect(contrastRatio(ink, tint)).toBeGreaterThanOrEqual(MIN_TEXT)
  })
})

describe('graphics', () => {
  it('keeps the ring and the target markers visible (3:1) against the screen', () => {
    for (const mark of [color.zoneOptimal, color.zonePain, color.bronze, color.ink]) {
      expect(contrastRatio(mark, edge)).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps every touch target at 48 px or more', () => {
    expect(geometry.touchMin).toBeGreaterThanOrEqual(48)
  })
})

/**
 * Marea (light). The two wave layers are translucent water over the paper; where they overlap
 * the water covers about 41 % of the way to the water color, so text is checked on that too.
 */
const MIN_GRAPHIC = 3
const waterOverlap = 1 - (1 - mareaGeometry.waveBackOpacity) * (1 - mareaGeometry.waveFrontOpacity)
const water = mixHex(m.paper, m.water, waterOverlap)

describe('Marea text on the screen', () => {
  const backgrounds = {
    paper: m.paper,
    'paper under the water': water,
    card: m.card,
    tint: m.accentTint,
    background: m.background,
  }
  const inks = { ink: m.ink, inkSecondary: m.inkSecondary, accentDark: m.accentDark }

  for (const [inkName, ink] of Object.entries(inks)) {
    for (const [bgName, bg] of Object.entries(backgrounds)) {
      // The darker blue is only used for text on the light surfaces.
      it(`${inkName} reaches ${MIN_TEXT}:1 on ${bgName}`, () => {
        expect(contrastRatio(ink, bg)).toBeGreaterThanOrEqual(MIN_TEXT)
      })
    }
  }

  it('reads the secondary text on the disabled menu buttons and the icon discs', () => {
    expect(contrastRatio(m.inkSecondary, m.line)).toBeGreaterThanOrEqual(MIN_TEXT)
    expect(contrastRatio(m.inkSecondary, m.background)).toBeGreaterThanOrEqual(MIN_TEXT)
  })
})

describe('Marea text inside filled shapes', () => {
  const pairs: [string, string, string][] = [
    ['onAccent on accent (primary button)', m.onAccent, m.accent],
    ['accentDark on tint (secondary button)', m.accentDark, m.accentTint],
    ['accentDark on paper (outline and link)', m.accentDark, m.paper],
    ['onMint on mint', m.onMint, m.mint],
    ['mintDark on mintTint (pill)', m.mintDark, m.mintTint],
    ['onAmber on amber', m.onAmber, m.amber],
    ['amberDark on amberTint (pill)', m.amberDark, m.amberTint],
    ['onRose on rose', m.onRose, m.rose],
    ['roseDark on roseTint (pill)', m.roseDark, m.roseTint],
    ['amberDark on paper under the water', m.amberDark, water],
    ['mintDark on paper under the water', m.mintDark, water],
  ]

  it.each(pairs)('%s reaches the text minimum', (_name, ink, bg) => {
    expect(contrastRatio(ink, bg)).toBeGreaterThanOrEqual(MIN_TEXT)
  })
})

describe('Marea graphics', () => {
  it('keeps the focus ring and the selection border visible (3:1) on every surface', () => {
    for (const surface of [m.paper, water, m.card, m.accentTint, m.background]) {
      expect(contrastRatio(m.accentDark, surface)).toBeGreaterThanOrEqual(MIN_GRAPHIC)
      expect(
        contrastRatio(m.accent, surface === m.accentTint ? m.paper : surface),
      ).toBeGreaterThanOrEqual(MIN_GRAPHIC)
    }
  })

  it('keeps the target notch and the marker border visible against the paper', () => {
    expect(contrastRatio(m.ink, m.paper)).toBeGreaterThanOrEqual(MIN_GRAPHIC)
    expect(contrastRatio(m.ink, water)).toBeGreaterThanOrEqual(MIN_GRAPHIC)
  })

  it('keeps every Marea control at the touch minimum', () => {
    expect(mareaGeometry.touchMin).toBeGreaterThanOrEqual(48)
    expect(mareaGeometry.menuButton).toBeGreaterThanOrEqual(44)
    expect(mareaGeometry.stepperButton).toBeGreaterThanOrEqual(48)
  })
})
