import type { GuideTip, GuideTipId } from '../../domain/guide'
import type { MessageKey, MessageParams } from '../../i18n/translate'
import type { Lang } from '../../data/types'

type Plural = { one: MessageKey; other: MessageKey }

/** The message of each tip; the ones that count something have a form per plural category. */
const MESSAGES: Record<GuideTipId, MessageKey | Plural> = {
  first: 'guide.first',
  painTrend: 'guide.painTrend',
  pain: { one: 'guide.pain.one', other: 'guide.pain.other' },
  overshoot: { one: 'guide.overshoot.one', other: 'guide.overshoot.other' },
  shortRange: 'guide.shortRange',
  declined: 'guide.declined',
  unheld: 'guide.unheld',
  improved: 'guide.improved',
  steady: 'guide.steady',
  markPain: 'guide.markPain',
  keepGoing: 'guide.keepGoing',
}

export interface TipMessage {
  key: MessageKey
  params: MessageParams
}

/** Picks the message of a tip in the language's plural form for the number it counts. */
export function tipMessage(tip: GuideTip, lang: Lang): TipMessage {
  const message = MESSAGES[tip.id]
  if (typeof message === 'string') return { key: message, params: tip.params }
  const category = new Intl.PluralRules(lang).select(tip.params.count ?? 0)
  return { key: category === 'one' ? message.one : message.other, params: tip.params }
}
