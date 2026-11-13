import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { Choice, ChoiceGroup } from './Choice'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function Harness({ variant }: { variant: 'row' | 'card' }) {
  const [value, setValue] = useState('es')
  return (
    <ChoiceGroup label="Idioma">
      {['es', 'en'].map((lang) => (
        <Choice
          key={lang}
          name="lang"
          value={lang}
          checked={value === lang}
          label={lang === 'es' ? 'Español' : 'English'}
          selectedLabel="Seleccionado"
          variant={variant}
          onSelect={setValue}
        >
          <span>{lang}</span>
        </Choice>
      ))}
    </ChoiceGroup>
  )
}

function mount(variant: 'row' | 'card' = 'row') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(Harness, { variant })))
  const input = (value: string) =>
    host.querySelector<HTMLInputElement>(`input[data-value="${value}"]`)!
  return { host, input }
}

describe('Choice', () => {
  it('is a named radio group of named radio inputs', () => {
    const { host, input } = mount()
    expect(host.querySelector('[role="radiogroup"]')?.getAttribute('aria-label')).toBe('Idioma')
    expect(input('es').getAttribute('aria-label')).toBe('Español')
    expect(input('es').type).toBe('radio')
    expect(input('es').checked).toBe(true)
    expect(input('en').checked).toBe(false)
  })

  it('marks the selected option with a named check, not only with color', () => {
    const { host } = mount()
    const checks = host.querySelectorAll('[role="img"]')
    expect(checks).toHaveLength(1)
    expect(checks[0]?.getAttribute('aria-label')).toBe('Seleccionado')
    expect(host.querySelector('[data-selected="true"]')).not.toBeNull()
  })

  it('moves the selection when another option is chosen', () => {
    const { host, input } = mount('card')
    act(() => input('en').click())
    expect(input('en').checked).toBe(true)
    expect(input('es').checked).toBe(false)
    expect(host.querySelectorAll('[role="img"]')).toHaveLength(1)
  })
})
