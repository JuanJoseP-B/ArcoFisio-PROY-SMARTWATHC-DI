import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../data/types'
import { I18nContext, buildI18n } from './I18nContext'

interface I18nProviderProps {
  /** Language to start in. */
  lang: Lang
  /** Called when `setLang` changes the language, so the choice can be saved. */
  onLangChange?: (lang: Lang) => void
  children?: ReactNode
}

export function I18nProvider({ lang: initial, onLangChange, children }: I18nProviderProps) {
  const [lang, setCurrent] = useState(initial)

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return
      setCurrent(next)
      onLangChange?.(next)
    },
    [lang, onLangChange],
  )

  const value = useMemo(() => buildI18n(lang, setLang), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
