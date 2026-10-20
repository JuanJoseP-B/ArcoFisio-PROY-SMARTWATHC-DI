import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PillButton } from './PillButton'
import { PRESS_DELAY_MS } from './pressTiming'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: reduced,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  stubReducedMotion(false)
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function mount(variant: 'primary' | 'secondary', onPress: () => void) {
  const host = document.createElement('div')
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(createElement(PillButton, { label: 'Iniciar', variant, onPress })))
  return { host, root, button: host.querySelector('button')! }
}

describe('PillButton primary', () => {
  it('shows the label with the arrow, the trail and the ripple', () => {
    const { host, button } = mount('primary', () => undefined)
    expect(button.textContent).toBe('Iniciar')
    expect(host.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
    expect(button.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2)
    expect(button.dataset.variant).toBe('primary')
  })

  it('plays the shot first and runs the action after the press delay, once', () => {
    const onPress = vi.fn()
    const { button } = mount('primary', onPress)

    act(() => button.click())
    expect(onPress).not.toHaveBeenCalled()
    expect(button.className).toContain('pressed')

    act(() => button.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS - 1)
    })
    expect(onPress).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('accepts a new press once the first has run', () => {
    const onPress = vi.fn()
    const { button } = mount('primary', onPress)
    act(() => button.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    act(() => button.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('drops the pressed look when the press animation ends', () => {
    const { button } = mount('primary', () => undefined)
    act(() => button.click())
    expect(button.className).toContain('pressed')
    // jsdom has no CSS animations, so React listens to the prefixed name there; send both.
    act(() => {
      button.dispatchEvent(new Event('animationend', { bubbles: true }))
      button.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }))
    })
    expect(button.className).not.toContain('pressed')
  })

  it('does not run the action if the screen closes during the shot', () => {
    const onPress = vi.fn()
    const { button, root } = mount('primary', onPress)
    act(() => button.click())
    act(() => root.unmount())
    roots.length = 0
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS * 2)
    })
    expect(onPress).not.toHaveBeenCalled()
  })

  it('acts at once, without animating, under reduced motion', () => {
    stubReducedMotion(true)
    const onPress = vi.fn()
    const { button } = mount('primary', onPress)
    act(() => button.click())
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(button.className).not.toContain('pressed')
  })
})

describe('PillButton secondary', () => {
  it('is an outlined button without the arrow that acts at once', () => {
    const onPress = vi.fn()
    const { host, button } = mount('secondary', onPress)
    expect(host.querySelector('svg')).toBeNull()
    expect(button.dataset.variant).toBe('secondary')
    act(() => button.click())
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('PillButton stylesheet', () => {
  const css = readFileSync(join(__dirname, 'PillButton.module.css'), 'utf8')

  it('uses the sheet sizes and the 2 px bronze outline', () => {
    expect(css).toMatch(/\.primary \{\s*width: 232px;\s*height: 52px/)
    expect(css).toMatch(/\.secondary \{\s*width: 200px;\s*height: 48px/)
    expect(css).toContain('box-shadow: inset 0 0 0 2px var(--af-color-bronze)')
  })

  it('keeps the sheet cycle of 2.6 s, played once from the first 8 %', () => {
    expect(css).toContain('animation: press 2600ms 1 both')
    expect(css).toContain('animation-delay: -208ms')
  })

  it('keeps the sheet keyframe moments', () => {
    expect(css).toMatch(/@keyframes press \{[^@]*14% \{\s*transform: scale\(0\.95\)/)
    expect(css).toMatch(/@keyframes shot \{[^@]*30% \{\s*transform: translateX\(170px\)/)
    expect(css).toMatch(/@keyframes ripple \{[^@]*40%,\s*100% \{\s*transform: scale\(14\)/)
    expect(css).toMatch(/@keyframes trail \{[^@]*24% \{\s*transform: scaleX\(1\)/)
    expect(css).toContain('width: 20px')
  })

  it('stops every animation under reduced motion', () => {
    const reduced = css.slice(css.indexOf('prefers-reduced-motion'))
    expect(reduced).toContain('animation: none')
  })
})
