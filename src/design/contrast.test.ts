import { describe, expect, it } from 'vitest'
import { contrastRatio, luminance, mixHex } from './contrast'
import { color, geometry } from './tokens'

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
