import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { geometry } from '../design/tokens'
import { FeatherFan } from './FeatherFan'
import { GoniometerRing } from './GoniometerRing'
import { targetRadius } from './ringGeometry'

const render = (angle: number, target = 150, zone: Parameters<typeof targetRadius>[0] = null) =>
  renderToString(<GoniometerRing angle={angle} target={target} zone={zone} />)

describe('GoniometerRing', () => {
  it('is a decorative 384 x 384 svg', () => {
    const html = render(0)
    expect(html).toContain('viewBox="0 0 384 384"')
    expect(html).toContain('aria-hidden="true"')
  })

  it('fills the arc as angle / 360 of the circumference, from the top', () => {
    const offset = (1030.44 * (1 - 90 / 360)).toFixed(2)
    const html = render(90)
    expect(html).toContain(`stroke-dasharray="${geometry.ringCircumference}"`)
    expect(html).toContain(`stroke-dashoffset="${offset}"`)
    expect(html).toContain('transform="rotate(-90 192 192)"')
  })

  it('rotates the knob with the angle and the target marker with the target', () => {
    const html = render(45, 120)
    expect(html).toMatch(/data-part="knob"/)
    expect(html).toContain('rotate(45.00 192 192)')
    expect(html).toContain('rotate(120.00 192 192)')
  })

  it('draws the dotted string only once the arm has moved', () => {
    expect(render(3)).toContain('opacity="0"')
    expect(render(40)).toContain('opacity="0.45"')
  })

  it('keeps angles outside 0-180 on the dial', () => {
    expect(render(-20)).toContain('rotate(0.00 192 192)')
    expect(render(250)).toContain('rotate(180.00 192 192)')
  })

  it('exposes the zone for styling', () => {
    expect(render(10, 90, 'overshoot')).toContain('data-zone="overshoot"')
    expect(render(10)).not.toContain('data-zone')
  })

  it('grows the target marker from 9 to 11 near and 14 on target', () => {
    expect(targetRadius(null)).toBe(9)
    expect(targetRadius('far')).toBe(9)
    expect(targetRadius('approach')).toBe(9)
    expect(targetRadius('near')).toBe(11)
    expect(targetRadius('target')).toBe(14)
    expect(render(90, 90, 'target')).toContain('r="14"')
  })
})

describe('GoniometerRing stylesheet', () => {
  const css = readFileSync(join(__dirname, 'GoniometerRing.module.css'), 'utf8')

  it('colors the arc for every zone that has its own tone', () => {
    for (const zone of ['approach', 'near', 'target', 'overshoot', 'pain', 'rest']) {
      expect(css, zone).toContain(`data-zone='${zone}'`)
    }
  })

  it('springs the target marker radius in 300 ms with the wheel curve', () => {
    expect(css).toContain('transition: r var(--af-dur-standard) var(--af-ease-wheel)')
  })
})

describe('GoniometerRing feedback visuals', () => {
  const css = readFileSync(join(__dirname, 'GoniometerRing.module.css'), 'utf8')

  it('draws a halo circle on the ring radius for the pulse', () => {
    const html = render(70, 90, 'approach')
    expect(html).toContain('data-part="halo"')
    expect(html.indexOf('data-part="halo"')).toBeLessThan(html.indexOf('data-part="arc"'))
  })

  it('beats the halo with the same periods as the sound: 700 ms far, 300 ms near', () => {
    expect(css).toMatch(/data-zone='approach'\] \.halo \{\s*animation: halo var\(--af-pulse-slow\)/)
    expect(css).toMatch(/data-zone='near'\] \.halo \{[^}]*animation: halo var\(--af-pulse-fast\)/)
  })

  it('blinks the red arc continuously past the target', () => {
    expect(css).toMatch(
      /data-zone='overshoot'\] \.arc \{\s*animation: blink 700ms [a-z-]+ infinite/,
    )
    expect(css).toContain('@keyframes blink')
  })

  it('shows no halo outside the approach zones and stops all pulsing under reduced motion', () => {
    expect(css).not.toMatch(/data-zone='(far|target|pain|rest)'\] \.halo/)
    const reduced = css.slice(css.indexOf('prefers-reduced-motion'))
    expect(reduced).toContain('animation: none')
    expect(reduced).toContain('.halo')
    expect(reduced).toContain("data-zone='overshoot'] .arc")
  })
})

describe('FeatherFan', () => {
  it('draws nine faint feathers', () => {
    const html = renderToString(<FeatherFan />)
    expect(html.match(/M192 384 Q174 250/g)).toHaveLength(9)
    expect(html).toContain('opacity="0.11"')
    expect(html).toContain('aria-hidden="true"')
  })
})
