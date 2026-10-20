import { DEFAULT_TOLERANCE_DEG } from '../domain/constants'
import type { StorageClient } from './storage'
import type { Lang, Settings } from './types'
import { parseSettings } from './validators'

export function detectLanguage(): Lang {
  const language = typeof navigator === 'undefined' ? '' : navigator.language
  return language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function defaultSettings(lang: Lang = detectLanguage()): Settings {
  return {
    lang,
    sound: true,
    vibration: true,
    targetDefault: 90,
    tolerance: DEFAULT_TOLERANCE_DEG,
    firstRunDone: false,
  }
}

export interface SettingsRepo {
  get(): Settings
  update(patch: Partial<Settings>): Settings
  reset(): void
}

export function createSettingsRepo(storage: StorageClient): SettingsRepo {
  const get = (): Settings => {
    const defaults = defaultSettings()
    return storage.read('settings', (value) => parseSettings(value, defaults)) ?? defaults
  }

  return {
    get,
    update(patch) {
      const current = get()
      const next = parseSettings({ ...current, ...patch }, current) ?? current
      storage.write('settings', next)
      return next
    },
    reset() {
      storage.remove('settings')
    },
  }
}
