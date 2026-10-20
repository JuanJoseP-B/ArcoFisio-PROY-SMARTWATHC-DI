import { describe, expect, it } from 'vitest'
import { INTRO_BRAND_PROGRESS, INTRO_PERIOD_MS, INTRO_RING_DASH, introFrame } from './frame'

const at = (p: number) => introFrame(p * INTRO_PERIOD_MS)

describe('introFrame timeline', () => {
  it('lasts 9 s and repeats', () => {
    expect(INTRO_PERIOD_MS).toBe(9000)
    const a = introFrame(1234)
    const b = introFrame(1234 + INTRO_PERIOD_MS)
    expect(b.nockX).toBeCloseTo(a.nockX, 10)
    expect(b.irisRadius).toBeCloseTo(a.irisRadius, 10)
    expect(b.sceneOpacity).toBeCloseTo(a.sceneOpacity, 10)
  })

  it('fades the scene in during the first 7 %', () => {
    expect(at(0).sceneOpacity).toBe(0)
    expect(at(0.035).sceneOpacity).toBeCloseTo(0.5, 5)
    expect(at(0.07).sceneOpacity).toBe(1)
  })

  it('brings the archer in from the left between 5 % and 18 %', () => {
    expect(at(0.05).manX).toBeCloseTo(-40, 5)
    expect(at(0.05).manOpacity).toBe(0)
    expect(at(0.18).manX).toBeCloseTo(0, 5)
    expect(at(0.18).manOpacity).toBe(1)
  })

  it('draws the bow between 22 % and 42 %, string back by 52 px', () => {
    expect(at(0.22).nockX).toBeCloseTo(224, 5)
    expect(at(0.32).nockX).toBeCloseTo(198, 5)
    expect(at(0.42).nockX).toBeCloseTo(172, 5)
    expect(at(0.44).nockX).toBeCloseTo(172, 5)
    expect(at(0.42).elbowX).toBeCloseTo(128, 5)
    expect(at(0.42).elbowY).toBeCloseTo(146, 5)
  })

  it('shows the arrow from 14 % and keeps it on the string while drawing', () => {
    expect(at(0.14).arrowOpacity).toBe(0)
    expect(at(0.2).arrowOpacity).toBe(1)
    expect(at(0.3).arrowX).toBeCloseTo(at(0.3).nockX, 10)
    expect(at(0.3).arrowY).toBe(0)
  })

  it('releases at 46 %: string shakes, arrow flies out and is gone by 52 %', () => {
    expect(at(0.46).arrowX).toBeCloseTo(172, 5)
    expect(at(0.49).arrowX).toBeGreaterThan(172)
    expect(at(0.49).arrowY).toBeLessThan(0)
    expect(at(0.52).arrowOpacity).toBe(0)

    const shaking = [0.47, 0.48, 0.5].map((p) => at(p).nockX - 224)
    expect(shaking.some((v) => v !== shaking[0])).toBe(true)
    expect(at(0.54).nockX).toBe(224)
  })

  it('floats a feather loose from 46 % to 66 %', () => {
    expect(at(0.4).floatOpacity).toBe(0)
    expect(at(0.5).floatOpacity).toBeGreaterThan(0.8)
    expect(at(0.66).floatOpacity).toBe(0)
    expect(at(0.46).floatTransform).toBe('translate(150.0 110.0) rotate(-40.0)')
  })

  it('opens the iris between 56 % and 66 %', () => {
    expect(at(0.56).irisRadius).toBe(0)
    expect(at(0.61).irisRadius).toBeCloseTo(145, 5)
    expect(at(0.66).irisRadius).toBeCloseTo(290, 5)
  })

  it('traces the brand ring between 63 % and 80 %', () => {
    expect(at(0.62).ringOpacity).toBe(0)
    expect(at(0.66).ringOpacity).toBe(1)
    expect(at(0.63).ringDashOffset).toBeCloseTo(INTRO_RING_DASH, 5)
    expect(at(0.8).ringDashOffset).toBeCloseTo(0, 5)
  })

  it('reveals the wordmark between 66 % and 76 %, rising 14 px', () => {
    expect(at(0.66).wordmarkOpacity).toBe(0)
    expect(at(0.66).wordmarkShift).toBeCloseTo(14, 5)
    expect(at(0.76).wordmarkOpacity).toBe(1)
    expect(at(0.78).wordmarkShift).toBeCloseTo(0, 5)
  })

  it('fades everything out between 94 % and 100 %', () => {
    expect(at(0.94).irisRadius).toBeCloseTo(290, 5)
    expect(at(0.97).irisRadius).toBeCloseTo(145, 5)
    expect(at(0.97).wordmarkOpacity).toBeCloseTo(0.5, 5)
    expect(at(0.9999).ringOpacity).toBeLessThan(0.01)
  })
})

describe('introFrame shapes', () => {
  it('builds 13 fan feathers, 7 trailing feathers and 46 grass blades', () => {
    const frame = introFrame(2500)
    expect(frame.fan).toHaveLength(13)
    expect(frame.trail).toHaveLength(7)
    expect(frame.grass).toHaveLength(46)
  })

  it('fans the feathers 13 degrees apart starting at 12 degrees, with a wind wobble', () => {
    const [first, second] = introFrame(0).fan
    expect(first).toBe('translate(150 124) rotate(12.0)')
    // -1 base plus sin(0.6) * 2.5 of wobble
    expect(second).toBe('translate(150 124) rotate(0.4)')
  })

  it('sways the grass and cycles three tones', () => {
    const a = introFrame(0).grass
    const b = introFrame(400).grass
    expect(a[0]?.d).not.toBe(b[0]?.d)
    expect(a.map((g) => g.tone).slice(0, 4)).toEqual([0, 1, 2, 0])
  })

  it('shows the finished brand lockup at the reduced-motion position', () => {
    const frame = at(INTRO_BRAND_PROGRESS)
    expect(frame.irisRadius).toBeCloseTo(290, 5)
    expect(frame.ringOpacity).toBe(1)
    expect(frame.ringDashOffset).toBeCloseTo(0, 5)
    expect(frame.wordmarkOpacity).toBe(1)
    expect(frame.wordmarkShift).toBeCloseTo(0, 5)
  })
})
