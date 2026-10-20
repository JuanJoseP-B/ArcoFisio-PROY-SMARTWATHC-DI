import type { Lang } from '../../data'

/**
 * Intro tagline per language. The wordmark itself (ARCO / FISIO) is the brand and is not
 * translated. Stage 13 moves these strings into the shared dictionaries.
 */
export const introCopy = {
  es: { tagline: 'Cada grado cuenta' },
  en: { tagline: 'Every degree counts' },
} as const satisfies Record<Lang, { tagline: string }>
