import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'
import type { IconName } from './IconButton'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(icon: IconName, onPress: () => void, disabled = false) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(IconButton, { icon, label: 'Reiniciar', onPress, disabled })))
  return host.querySelector<HTMLButtonElement>('button')!
}

describe('IconButton', () => {
  it('is named by its label and draws only a decorative icon', () => {
    const button = mount('reset', () => undefined)
    expect(button.getAttribute('aria-label')).toBe('Reiniciar')
    expect(button.textContent).toBe('')
    expect(button.querySelector('svg[aria-hidden="true"] path')).not.toBeNull()
    expect(button.dataset.icon).toBe('reset')
  })

  it('has a different drawing for each icon', () => {
    const icons: IconName[] = [
      'back',
      'reset',
      'calibrate',
      'play',
      'pause',
      'next',
      'stop',
      'plus',
      'edit',
      'trash',
      'history',
    ]
    const drawings = icons.map((icon) =>
      [...mount(icon, () => undefined).querySelectorAll('path')]
        .map((p) => p.getAttribute('d'))
        .join('|'),
    )
    expect(new Set(drawings).size).toBe(icons.length)
  })

  it('presses', () => {
    const onPress = vi.fn()
    const button = mount('calibrate', onPress)
    act(() => button.click())
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does nothing while disabled', () => {
    const onPress = vi.fn()
    const button = mount('back', onPress, true)
    expect(button.disabled).toBe(true)
    act(() => button.click())
    expect(onPress).not.toHaveBeenCalled()
  })
})
