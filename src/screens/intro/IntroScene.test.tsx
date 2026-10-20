import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { color, sceneColor } from '../../design/tokens'
import { INTRO_BRAND_PROGRESS, INTRO_PERIOD_MS, introFrame } from './frame'
import { IntroScene } from './IntroScene'

const render = (ms: number) => renderToString(<IntroScene frame={introFrame(ms)} />)

describe('IntroScene', () => {
  it('draws a 384 x 384 decorative svg', () => {
    const html = render(0)
    expect(html).toContain('viewBox="0 0 384 384"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('data-part="intro-scene"')
  })

  it('draws the 46 blades of grass in the three grass tones', () => {
    const html = render(1000)
    const blades = html.match(/stroke-width="3" fill="none" stroke-linecap="round"/g) ?? []
    expect(blades).toHaveLength(46)
    for (const tone of [color.bronze, sceneColor.hillNear, sceneColor.hillFar]) {
      expect(html).toContain(`stroke="${tone}"`)
    }
  })

  it('draws the 13-feather headdress and the 7-feather trail', () => {
    const html = render(1000)
    const longFeathers = html.match(/<line x1="0" y1="-8" x2="0" y2="-18"/g) ?? []
    const trail = html.match(/d="M0 -6 Q-6 -24 0 -44/g) ?? []
    expect(longFeathers).toHaveLength(13)
    expect(trail).toHaveLength(7)
  })

  it('pulls the string to the nock point of the current frame', () => {
    const drawn = render(0.42 * INTRO_PERIOD_MS)
    expect(drawn).toContain('d="M224 78 L 172.0 140 L 224 202"')
    expect(render(0)).toContain('d="M224 78 L 224.0 140 L 224 202"')
  })

  it('opens the iris and traces the brand ring over time', () => {
    const closed = render(0)
    expect(closed).toContain('r="0.0"')

    const brand = render(INTRO_BRAND_PROGRESS * INTRO_PERIOD_MS)
    expect(brand).toContain('r="290.0"')
    expect(brand).toContain('stroke-dasharray="1068"')
    expect(brand).toContain('stroke-dashoffset="0.0"')
  })

  it('takes every color from the design tokens', () => {
    const html = render(2000)
    expect(html).toContain(`fill="${sceneColor.skin}"`)
    expect(html).toContain(`stroke="${color.gold}"`)
    expect(html).toContain(`fill="${color.ink}"`)
  })
})
