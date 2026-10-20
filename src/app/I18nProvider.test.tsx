import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from './I18nProvider'
import { useI18n } from './useI18n'

describe('I18nProvider', () => {
  function Label() {
    const { lang, t } = useI18n()
    return <span>{`${lang}:${t('zone.rest')}`}</span>
  }

  it('gives descendants the chosen language', () => {
    const spanish = renderToString(
      <I18nProvider lang="es">
        <Label />
      </I18nProvider>,
    )
    const english = renderToString(
      <I18nProvider lang="en">
        <Label />
      </I18nProvider>,
    )
    expect(spanish).toContain('es:Descanso')
    expect(english).toContain('en:Rest')
  })

  it('falls back to the browser language without a provider', () => {
    expect(renderToString(<Label />)).toMatch(/(es:Descanso|en:Rest)/)
  })

  describe('changing the language', () => {
    function Switch() {
      const { lang, t, setLang } = useI18n()
      return (
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}>
          {`${lang}:${t('zone.rest')}`}
        </button>
      )
    }

    function mount(lang: 'es' | 'en', onLangChange?: (lang: 'es' | 'en') => void) {
      ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
      const host = document.createElement('div')
      const root = createRoot(host)
      act(() =>
        root.render(
          createElement(
            I18nProvider,
            onLangChange ? { lang, onLangChange } : { lang },
            createElement(Switch),
          ),
        ),
      )
      const button = host.querySelector('button')!
      return { button, unmount: () => act(() => root.unmount()) }
    }

    it('switches every descendant and reports the new language once', () => {
      const onLangChange = vi.fn()
      const { button, unmount } = mount('es', onLangChange)
      expect(button.textContent).toBe('es:Descanso')

      act(() => button.click())
      expect(button.textContent).toBe('en:Rest')
      expect(onLangChange).toHaveBeenCalledTimes(1)
      expect(onLangChange).toHaveBeenCalledWith('en')
      unmount()
    })

    it('does not report a choice that changes nothing', () => {
      const onLangChange = vi.fn()
      function Same() {
        const { setLang } = useI18n()
        return <button onClick={() => setLang('es')}>same</button>
      }
      const host = document.createElement('div')
      const root = createRoot(host)
      act(() =>
        root.render(createElement(I18nProvider, { lang: 'es', onLangChange }, createElement(Same))),
      )
      act(() => host.querySelector('button')?.click())
      expect(onLangChange).not.toHaveBeenCalled()
      act(() => root.unmount())
    })

    it('keeps the page language in step with the chosen one', () => {
      const { button, unmount } = mount('es')
      expect(document.documentElement.lang).toBe('es')
      act(() => button.click())
      expect(document.documentElement.lang).toBe('en')
      unmount()
    })

    it('ignores the request when there is no provider', () => {
      function Lone() {
        const { lang, setLang } = useI18n()
        setLang(lang)
        return null
      }
      expect(() => renderToString(<Lone />)).not.toThrow()
    })
  })
})
