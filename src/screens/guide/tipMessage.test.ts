import { describe, expect, it } from 'vitest'
import type { GuideTip } from '../../domain/guide'
import { dictionaries } from '../../i18n/translate'
import type { MessageKey } from '../../i18n/translate'
import { tipMessage } from './tipMessage'

const tip = (id: GuideTip['id'], params: GuideTip['params'] = {}): GuideTip => ({
  id,
  tone: 'info',
  params,
})

describe('tipMessage', () => {
  it('uses the singular form for one and the plural form for any other number', () => {
    expect(tipMessage(tip('pain', { count: 1 }), 'es').key).toBe('guide.pain.one')
    expect(tipMessage(tip('pain', { count: 2 }), 'es').key).toBe('guide.pain.other')
    expect(tipMessage(tip('overshoot', { count: 1 }), 'en').key).toBe('guide.overshoot.one')
    expect(tipMessage(tip('overshoot', { count: 5 }), 'en').key).toBe('guide.overshoot.other')
  })

  it('passes the numbers of the tip on to the message', () => {
    expect(tipMessage(tip('shortRange', { target: 90, max: 80 }), 'es')).toEqual({
      key: 'guide.shortRange',
      params: { target: 90, max: 80 },
    })
  })

  it('has a message for every kind of tip, in both languages', () => {
    const ids: GuideTip['id'][] = [
      'first',
      'painTrend',
      'pain',
      'overshoot',
      'shortRange',
      'declined',
      'unheld',
      'improved',
      'steady',
      'markPain',
      'keepGoing',
    ]
    for (const lang of ['es', 'en'] as const) {
      for (const id of ids) {
        const { key } = tipMessage(tip(id, { count: 2 }), lang)
        expect(
          (dictionaries[lang] as Record<MessageKey, string>)[key],
          `${lang} ${id}`,
        ).toBeTruthy()
      }
    }
  })
})
