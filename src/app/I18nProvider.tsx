import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../data/types'
import { I18nContext, buildI18n } from './I18nContext'

interface I18nProviderProps {
  lang: Lang
  children?: ReactNode
}

export function I18nProvider({ lang, children }: I18nProviderProps) {
  const value = useMemo(() => buildI18n(lang), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
