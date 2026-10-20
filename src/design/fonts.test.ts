import { describe, expect, it } from 'vitest'
import { cinzelUrl, loadBrandFont, robotoFlexUrl } from './fonts'

describe('fonts', () => {
  it('requests both families with font-display: swap', () => {
    expect(robotoFlexUrl).toContain('display=swap')
    expect(cinzelUrl).toContain('display=swap')
  })

  it('loads Cinzel only on demand and only once', () => {
    expect(document.head.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(0)
    const first = loadBrandFont()
    const second = loadBrandFont()
    expect(second).toBe(first)
    expect(document.head.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(1)
  })
})
