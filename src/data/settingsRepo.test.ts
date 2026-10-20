import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './storage'
import { createSettingsRepo, defaultSettings, detectLanguage } from './settingsRepo'
import { FakeStorage } from './testStorage'

const setBrowserLanguage = (language: string) =>
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language)

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})
afterEach(() => vi.restoreAllMocks())

describe('language detection', () => {
  it.each([
    ['es', 'es'],
    ['es-MX', 'es'],
    ['ES-ar', 'es'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
    ['', 'en'],
  ])('maps %s to %s', (browser, expected) => {
    setBrowserLanguage(browser)
    expect(detectLanguage()).toBe(expected)
  })
})

describe('settings repository', () => {
  it('returns the defaults, in the browser language, when nothing is stored', () => {
    setBrowserLanguage('es-CO')
    const repo = createSettingsRepo(createStorage(new FakeStorage()))
    expect(repo.get()).toEqual({
      lang: 'es',
      sound: true,
      vibration: true,
      targetDefault: 90,
      tolerance: 2,
      firstRunDone: false,
    })
  })

  it('persists updates and merges them with the stored values', () => {
    setBrowserLanguage('en-US')
    const backend = new FakeStorage()
    const repo = createSettingsRepo(createStorage(backend))
    repo.update({ lang: 'es', sound: false })
    repo.update({ targetDefault: 120 })

    const reopened = createSettingsRepo(createStorage(backend)).get()
    expect(reopened).toMatchObject({ lang: 'es', sound: false, targetDefault: 120 })
  })

  it('ignores invalid values in an update', () => {
    const repo = createSettingsRepo(createStorage(new FakeStorage()))
    const next = repo.update({ targetDefault: 999, tolerance: -3 })
    expect(next.targetDefault).toBe(90)
    expect(next.tolerance).toBe(2)
  })

  it('repairs a partially corrupt record field by field', () => {
    setBrowserLanguage('en')
    const backend = new FakeStorage()
    backend.seed(
      'arcofisio:v1:settings',
      JSON.stringify({ schema: 1, data: { lang: 'es', sound: 'loud', targetDefault: 100 } }),
    )
    const settings = createSettingsRepo(createStorage(backend)).get()
    expect(settings).toMatchObject({ lang: 'es', sound: true, targetDefault: 100 })
  })

  it('falls back to defaults on unreadable data', () => {
    setBrowserLanguage('en')
    const backend = new FakeStorage()
    backend.seed('arcofisio:v1:settings', 'garbage')
    expect(createSettingsRepo(createStorage(backend)).get()).toEqual(defaultSettings('en'))
  })

  it('reset returns to the defaults', () => {
    setBrowserLanguage('en')
    const repo = createSettingsRepo(createStorage(new FakeStorage()))
    repo.update({ sound: false })
    repo.reset()
    expect(repo.get()).toEqual(defaultSettings('en'))
  })

  it('keeps working in memory when storage is full', () => {
    const backend = new FakeStorage()
    backend.failWrites = true
    const repo = createSettingsRepo(createStorage(backend))
    repo.update({ vibration: false })
    expect(repo.get().vibration).toBe(false)
  })
})
