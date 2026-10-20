import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'
import { createTranslator, dictionaries, translate } from './translate'

const placeholders = (text: string): string[] => (text.match(/\{\w+\}/g) ?? []).sort()

describe('dictionaries', () => {
  it('have exactly the same keys in Spanish and English', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort())
  })

  it('have no empty message', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const [key, value] of Object.entries(dictionaries[lang])) {
        expect(value.trim(), `${lang}:${key}`).not.toBe('')
      }
    }
  })

  it('use the same placeholders in both languages', () => {
    for (const key of Object.keys(es) as (keyof typeof es)[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(es[key]))
    }
  })

  it('translate the zone words, which always accompany the color', () => {
    expect(es['zone.target']).toBe('Objetivo alcanzado')
    expect(es['zone.overshoot']).toBe('Te pasaste')
    expect(en['zone.target']).toBe('Target reached')
  })
})

describe('translate', () => {
  it('returns the message for the language', () => {
    expect(translate('es', 'zone.far')).toBe('En camino')
    expect(translate('en', 'zone.far')).toBe('On the way')
  })

  it('fills placeholders and leaves unknown ones untouched', () => {
    expect(translate('es', 'session.progress', { done: 3, total: 10 })).toBe('3 de 10')
    expect(translate('en', 'session.progress', { done: 3 })).toBe('3 of {total}')
  })

  it('binds a language in a translator', () => {
    const t = createTranslator('en')
    expect(t('zone.pain')).toBe('Pain')
  })
})
