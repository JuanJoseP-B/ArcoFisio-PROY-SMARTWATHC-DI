import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Zone } from '../domain/zones'
import { ZoneChip } from './ZoneChip'
import { ZoneIcon } from './ZoneIcon'
import { zoneGesture } from './zoneGesture'

const ZONES: Zone[] = ['far', 'approach', 'near', 'target', 'overshoot', 'pain', 'rest']

describe('zoneGesture', () => {
  it('maps each zone to a gesture of sheet 05', () => {
    expect(zoneGesture('far')).toBe('still')
    expect(zoneGesture('approach')).toBe('buzz')
    expect(zoneGesture('near')).toBe('buzz')
    expect(zoneGesture('target')).toBe('fly')
    expect(zoneGesture('overshoot')).toBe('pain')
    expect(zoneGesture('pain')).toBe('pain')
    expect(zoneGesture('rest')).toBe('rest')
  })
})

describe('ZoneIcon', () => {
  it('is a decorative 18 px icon by default', () => {
    const html = renderToString(<ZoneIcon zone="target" />)
    expect(html).toContain('width="18"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('data-gesture="fly"')
  })

  it('draws something for every zone', () => {
    for (const zone of ZONES) {
      const html = renderToString(<ZoneIcon zone={zone} size={28} />)
      expect(html, zone).toMatch(/<path|<line/)
      expect(html, zone).toContain('width="28"')
    }
  })

  it('animates the arrow only when it flies, and not when the bow is still', () => {
    expect(renderToString(<ZoneIcon zone="target" />)).toMatch(/class="[^"]*fly/)
    expect(renderToString(<ZoneIcon zone="far" />)).not.toMatch(/class="[^"]*fly/)
  })
})

describe('ZoneChip', () => {
  it('shows the given word for the zone, never color alone', () => {
    const html = renderToString(<ZoneChip zone="overshoot" label="Te pasaste" />)
    expect(html).toContain('Te pasaste')
    expect(html).toContain('data-zone="overshoot"')
    expect(html).toContain('role="status"')
  })

  it('can hide the icon', () => {
    expect(renderToString(<ZoneChip zone="far" label="En camino" icon={false} />)).not.toContain(
      'data-part="zone-icon"',
    )
    expect(renderToString(<ZoneChip zone="far" label="En camino" />)).toContain(
      'data-part="zone-icon"',
    )
  })
})

describe('chip and icon stylesheets', () => {
  const chip = readFileSync(join(__dirname, 'ZoneChip.module.css'), 'utf8')
  const icon = readFileSync(join(__dirname, 'ZoneIcon.module.css'), 'utf8')

  it('colors every zone with the sheet palette and changes color in 90 ms', () => {
    for (const zone of ['approach', 'target', 'overshoot', 'rest']) {
      expect(chip, zone).toContain(`data-zone='${zone}'`)
    }
    expect(chip).toContain('var(--af-color-zone-optimal-tint)')
    expect(chip).toContain('background-color var(--af-dur-instant)')
  })

  it('keeps the sheet gesture timings', () => {
    expect(icon).toContain('fly 1200ms')
    expect(icon).toContain('buzz 130ms')
    expect(icon).toContain('shake 900ms')
    expect(icon).toContain('droop 900ms')
    expect(icon).toContain('breathe var(--af-dur-ambient)')
  })

  it('stops the gestures under reduced motion', () => {
    const reduced = icon.slice(icon.indexOf('prefers-reduced-motion'))
    expect(reduced).toContain('animation: none')
  })
})
