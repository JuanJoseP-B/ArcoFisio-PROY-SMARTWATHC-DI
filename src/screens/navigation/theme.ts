import type { ScreenTheme } from '../../design/theme'
import type { Route, ScreenId } from './stack'

export type { ScreenTheme }

/**
 * Screens 00-07 of the handoff already wear Marea. Everything else (session, routines, measure,
 * pain arc, history, guide, settings, summary) keeps the v1 look until its own phase.
 */
const MAREA_SCREENS: ReadonlySet<ScreenId> = new Set([
  'intro',
  'welcome',
  'language',
  'setup',
  'face',
  'launcher',
  'mode',
  'config',
])

export const themeForRoute = (route: Route): ScreenTheme =>
  MAREA_SCREENS.has(route.id) ? 'marea' : 'classic'
