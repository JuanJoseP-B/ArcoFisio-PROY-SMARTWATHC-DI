import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToggleRow } from './ToggleRow'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function mount(checked: boolean, onChange = vi.fn()) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(ToggleRow, {
        label: 'Sonido',
        stateText: checked ? 'Activado' : 'Desactivado',
        checked,
        onChange,
      }),
    ),
  )
  return { button: host.querySelector<HTMLButtonElement>('button')!, onChange, host }
}

describe('ToggleRow', () => {
  it('is a switch with its name and its state in words', () => {
    const { button, host } = mount(true)
    expect(button.getAttribute('role')).toBe('switch')
    expect(button.getAttribute('aria-checked')).toBe('true')
    expect(button.textContent).toContain('Sonido')
    expect(host.querySelector('[data-part="toggle-state"]')?.textContent).toBe('Activado')
  })

  it('asks for the opposite value when pressed', () => {
    const on = mount(true)
    act(() => on.button.click())
    expect(on.onChange).toHaveBeenCalledWith(false)

    const off = mount(false)
    act(() => off.button.click())
    expect(off.onChange).toHaveBeenCalledWith(true)
  })

  it('reports an unchecked switch', () => {
    const { button } = mount(false)
    expect(button.getAttribute('aria-checked')).toBe('false')
    expect(button.dataset.checked).toBe('false')
  })
})
