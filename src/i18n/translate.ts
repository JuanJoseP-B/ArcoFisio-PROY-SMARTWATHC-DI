import type { Lang } from '../data/types'
import { en } from './en'
import { es } from './es'
import type { MessageKey } from './es'

export type { MessageKey }
export type MessageParams = Record<string, string | number>

export const dictionaries: Record<Lang, Record<MessageKey, string>> = { es, en }

/** Looks a message up and fills its `{name}` placeholders. */
export function translate(lang: Lang, key: MessageKey, params?: MessageParams): string {
  const template = dictionaries[lang][key]
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  )
}

export type Translator = (key: MessageKey, params?: MessageParams) => string

export const createTranslator =
  (lang: Lang): Translator =>
  (key, params) =>
    translate(lang, key, params)
