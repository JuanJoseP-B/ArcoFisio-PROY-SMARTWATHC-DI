import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'

/**
 * The labels of chips, buttons and launcher cells must fit one line inside the safe circle in
 * both languages (checked by eye in the browser; this keeps them from growing back). A 200 px
 * button at 15 px holds about 24 characters; a launcher cell label about 12.
 */
const MAX_LINE = 26
const MAX_CELL = 12

const dictionaries = { es, en } as const
const keys = Object.keys(es) as (keyof typeof es)[]

const ONE_LINE =
  /^(zone\.|player\.|done\.|builder\.(previous|save|delete|confirmYes|cancel)|config\.(start|next)|settings\.(erase|confirmYes|on|off)|pain\.(start|end|clean)|measure\.(reset|recalibrate)|sensor\.(enable|calibrate))/
const LONG_TEMPLATE = /\{/

describe('labels that must fit on one line', () => {
  const oneLine = keys.filter((key) => ONE_LINE.test(key) && !LONG_TEMPLATE.test(es[key]))

  it('has labels to check', () => {
    expect(oneLine.length).toBeGreaterThan(20)
  })

  for (const lang of ['es', 'en'] as const) {
    it(`stay within ${MAX_LINE} characters in ${lang}`, () => {
      const tooLong = oneLine.filter((key) => dictionaries[lang][key].length > MAX_LINE)
      expect(tooLong.map((key) => `${key}: ${dictionaries[lang][key]}`)).toEqual([])
    })

    it(`keep the launcher cell names within ${MAX_CELL} characters in ${lang}`, () => {
      const cells = keys.filter((key) => key.startsWith('launcher.') && key !== 'launcher.label')
      const tooLong = cells.filter((key) => dictionaries[lang][key].length > MAX_CELL)
      expect(tooLong.map((key) => `${key}: ${dictionaries[lang][key]}`)).toEqual([])
    })
  }
})
