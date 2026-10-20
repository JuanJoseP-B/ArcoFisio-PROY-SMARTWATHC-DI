import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import type { Lang } from '../../data/types'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { LanguageSelect } from './LanguageSelect'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })),
  )
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function mount(lang: Lang = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen = { id: '' }
  const chosen = vi.fn()
  function Spy() {
    seen.id = useNav().route.id
    return null
  }
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang, onLangChange: chosen },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'language' }] } },
          createElement(LanguageSelect),
          createElement(Spy),
        ),
      ),
    ),
  )
  const pills = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]')]
  const press = (index: number) => {
    act(() => pills()[index]?.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
  }
  return { host, seen, chosen, pills, press }
}

describe('LanguageSelect', () => {
  it('offers both languages, each in its own name', () => {
    const { host, pills } = mount('es')
    expect(host.querySelector('h1')?.textContent).toBe('Idioma')
    expect(pills().map((b) => b.textContent)).toEqual(['Español', 'English'])
  })

  it('shows the same names whichever language is on', () => {
    const { host, pills } = mount('en')
    expect(host.querySelector('h1')?.textContent).toBe('Language')
    expect(pills().map((b) => b.textContent)).toEqual(['Español', 'English'])
  })

  it('applies the chosen language at once, reports it and moves on to the sensor setup', () => {
    const { host, seen, chosen, press } = mount('es')
    press(1)
    expect(chosen).toHaveBeenCalledWith('en')
    expect(host.querySelector('h1')?.textContent).toBe('Language')
    expect(seen.id).toBe('setup')
  })

  it('moves on without reporting when the language is kept', () => {
    const { seen, chosen, press } = mount('es')
    press(0)
    expect(chosen).not.toHaveBeenCalled()
    expect(seen.id).toBe('setup')
  })
})
