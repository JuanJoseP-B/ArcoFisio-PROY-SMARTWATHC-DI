import { describe, expect, it } from 'vitest'

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

const sources = import.meta.glob<string>(
  ['../**/*.{ts,tsx,css}', '!../design/**', '!../**/*.test.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
)

describe('design tokens are the only source of color', () => {
  it('scans the application sources', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0)
  })

  it('has no hex, rgb or hsl literals outside src/design', () => {
    const offenders: string[] = []
    for (const [file, text] of Object.entries(sources)) {
      text.split('\n').forEach((line, i) => {
        if (COLOR_LITERAL.test(line)) offenders.push(`${file}:${i + 1}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
