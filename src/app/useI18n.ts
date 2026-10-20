import { useContext } from 'react'
import { I18nContext } from './I18nContext'
import type { I18n } from './I18nContext'

export const useI18n = (): I18n => useContext(I18nContext)
