import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BeadPattern } from './BeadPattern'

describe('BeadPattern', () => {
  const html = renderToStaticMarkup(
    <svg>
      <BeadPattern width={200} height={16} opacity={0.5} />
    </svg>,
  )

  it('draws the 24x16 triangle bead tile and fills the rectangle with it', () => {
    expect(html).toContain('width="24"')
    expect(html).toContain('height="16"')
    const id = /<pattern id="([^"]+)"/.exec(html)?.[1]
    expect(id).toBeDefined()
    expect(html).toContain(`fill="url(#${id})"`)
  })

  it('uses a CSS-safe id and honours the opacity', () => {
    expect(html).not.toMatch(/id="[^"]*:/)
    expect(html).toContain('opacity="0.5"')
  })
})
