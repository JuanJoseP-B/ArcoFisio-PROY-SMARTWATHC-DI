import { createContext } from 'react'
import { detectLanguage } from '../data/settingsRepo'
import type { Lang } from '../data/types'
import { createTranslator } from '../i18n/translate'
import type { Translator } from '../i18n/translate'

export interface I18n {
  lang: Lang
  t: Translator
  /** Switches the language for the whole watch; only the provider can really do it. */
  setLang(lang: Lang): void
}

export const buildI18n = (lang: Lang, setLang: (lang: Lang) => void = () => undefined): I18n => ({
  lang,
  t: createTranslator(lang),
  setLang,
})

// Without a provider (isolated component tests) the browser language is used.
export const I18nContext = createContext<I18n>(buildI18n(detectLanguage()))
