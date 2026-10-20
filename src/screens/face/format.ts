import type { Lang } from '../../data/types'

/** Time of day in the language's usual style: 14:05 in Spanish, 2:05 PM in English. */
export const formatTime = (date: Date, lang: Lang): string =>
  new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' }).format(date)

/** Weekday, day and month, e.g. "martes, 20 de octubre". */
export const formatDate = (date: Date, lang: Lang): string =>
  new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
