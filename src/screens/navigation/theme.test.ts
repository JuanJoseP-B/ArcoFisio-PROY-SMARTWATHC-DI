import { describe, expect, it } from 'vitest'
import type { ScreenId } from './stack'
import { themeForRoute } from './theme'

describe('themeForRoute', () => {
  it('dresses screens 00 to 07 in Marea', () => {
    const marea: ScreenId[] = [
      'intro',
      'welcome',
      'language',
      'setup',
      'face',
      'launcher',
      'mode',
      'config',
    ]
    for (const id of marea) expect(themeForRoute({ id })).toBe('marea')
  })

  it('keeps the screens of later phases in the classic palette', () => {
    const classic: ScreenId[] = [
      'session',
      'measure',
      'routines',
      'routine',
      'builder',
      'summary',
      'history',
      'pain',
      'guide',
      'settings',
    ]
    for (const id of classic) expect(themeForRoute({ id })).toBe('classic')
  })
})
