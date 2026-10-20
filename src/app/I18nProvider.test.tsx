import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
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
})
