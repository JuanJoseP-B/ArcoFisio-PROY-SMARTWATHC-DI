import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmButton } from './ConfirmButton'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(onConfirm: () => void) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(ConfirmButton, { label: 'Continuar', onConfirm })))
  return host.querySelector<HTMLButtonElement>('button')!
}

describe('ConfirmButton', () => {
  it('is a button named by its label, with a decorative check mark', () => {
    const button = mount(() => undefined)
    expect(button.getAttribute('aria-label')).toBe('Continuar')
    expect(button.textContent).toBe('')
    expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })

  it('confirms on press', () => {
    const onConfirm = vi.fn()
    const button = mount(onConfirm)
    act(() => button.click())
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
