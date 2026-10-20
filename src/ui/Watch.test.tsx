import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SafeZone, WatchScreen } from './WatchScreen'
import { WatchBezel } from './WatchBezel'

describe('watch shell', () => {
  it('nests the screen inside the bezel and draws the glass above it', () => {
    const html = renderToString(
      <WatchBezel>
        <WatchScreen>
          <SafeZone>hola</SafeZone>
        </WatchScreen>
      </WatchBezel>,
    )
    const order = [
      'data-part="bezel"',
      'data-part="screen"',
      'data-part="safe-zone"',
      'data-part="glass"',
    ]
    const positions = order.map((part) => html.indexOf(part))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    expect(html).toContain('hola')
  })

  it('hides the decorative glass from assistive tech', () => {
    const html = renderToString(<WatchBezel>{null}</WatchBezel>)
    expect(html).toMatch(
      /data-part="glass"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-part="glass"/,
    )
  })
})
