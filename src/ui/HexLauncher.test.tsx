import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BeadBands } from './BeadBands'
import { HexLauncher } from './HexLauncher'
import type { LauncherId } from './hexLayout'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const NAMES: Record<LauncherId, string> = {
  measure: 'Medir',
  session: 'Sesión',
  routines: 'Rutinas',
  summary: 'Resumen',
  pain: 'Dolor',
  guide: 'Guía IA',
  settings: 'Ajustes',
}

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function mount(onSelect: (id: LauncherId) => void = () => undefined) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(createElement(HexLauncher, { label: 'Aplicaciones', names: NAMES, onSelect })),
  )
  const cell = (id: LauncherId) => host.querySelector<HTMLButtonElement>(`[data-cell="${id}"]`)!
  return { host, cell }
}

const key = (el: HTMLElement, name: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))
  })

describe('HexLauncher', () => {
  it('renders the seven apps as labelled buttons in tab order', () => {
    const { host } = mount()
    const buttons = [...host.querySelectorAll('button')]
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(Object.values(NAMES))
    expect(buttons.every((b) => b.tabIndex === 0)).toBe(true)
    expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Aplicaciones')
  })

  it('shows the name on each cell and hides the decorative icons', () => {
    const { cell } = mount()
    expect(cell('guide').textContent).toBe('Guía IA')
    expect(cell('guide').querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })

  it('starts with the center cell focused and swollen', () => {
    const { cell } = mount()
    expect(cell('measure').dataset.focused).toBe('true')
    expect(cell('measure').style.transform).toBe('scale(1.2)')
    expect(cell('session').dataset.focused).toBe('false')
    expect(cell('session').style.transform).toBe('scale(0.94)')
  })

  it('moves the focus with the arrow keys, also moving the real DOM focus', () => {
    const { cell } = mount()
    cell('measure').focus()
    key(cell('measure'), 'ArrowRight')

    expect(document.activeElement).toBe(cell('session'))
    expect(cell('session').dataset.focused).toBe('true')
    expect(cell('session').style.transform).toBe('scale(1.2)')
    expect(cell('routines').style.transform).toBe('scale(0.82)')

    key(cell('session'), 'ArrowUp')
    expect(document.activeElement).toBe(cell('summary'))
  })

  it('ignores keys that are not arrows and stays at the edge', () => {
    const { cell } = mount()
    key(cell('measure'), 'a')
    expect(cell('measure').dataset.focused).toBe('true')

    cell('measure').focus()
    key(cell('measure'), 'ArrowRight')
    key(cell('session'), 'ArrowRight')
    expect(cell('session').dataset.focused).toBe('true')
  })

  it('follows the finger or pointer', () => {
    const { cell } = mount()
    act(() => {
      cell('pain').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })
    expect(cell('pain').dataset.focused).toBe('true')
    expect(cell('measure').dataset.focused).toBe('false')
  })

  it('opens an app on tap or Enter (a click)', () => {
    const onSelect = vi.fn()
    const { cell } = mount(onSelect)
    act(() => cell('settings').click())
    act(() => cell('routines').click())
    expect(onSelect.mock.calls).toEqual([['settings'], ['routines']])
  })

  it('draws a separate hexagonal focus ring in every cell for keyboard users', () => {
    const html = renderToString(
      <HexLauncher label="Aplicaciones" names={NAMES} onSelect={() => undefined} />,
    )
    expect(html.match(/data-part="focus-ring"/g)).toHaveLength(7)
    expect(html.match(/<polygon/g)).toHaveLength(7)
  })
})

describe('HexLauncher stylesheet', () => {
  const css = readFileSync(join(__dirname, 'HexLauncher.module.css'), 'utf8')

  it('uses the sheet hexagon, sizes and the honeycomb spring', () => {
    expect(css).toContain('polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)')
    expect(css).toContain('width: 84px')
    expect(css).toContain('height: 96px')
    expect(css).toContain('var(--af-dur-standard) var(--af-ease-honeycomb)')
  })

  it('paints the focused cell green on cream and the rest cream on green', () => {
    expect(css).toMatch(/data-focused='true'\] \.hex \{\s*background: var\(--af-color-ink\)/)
    expect(css).toContain('color: var(--af-color-ink-on-primary)')
    expect(css).toMatch(/\.hex \{[^}]*background: var\(--af-color-surface\)/)
  })

  it('shows the focus ring only for keyboard focus', () => {
    expect(css).toContain('.cell:focus-visible .ring')
  })

  it('drops the transitions under reduced motion', () => {
    expect(css.slice(css.indexOf('prefers-reduced-motion'))).toContain('transition: none')
  })
})

describe('BeadBands', () => {
  it('draws two faint bands from the 32 x 28 bead tile', () => {
    const html = renderToString(<BeadBands />)
    expect(html).toContain('width="32" height="28"')
    expect(html.match(/<rect x="0"/g)).toHaveLength(2)
    expect(html).toContain('opacity="0.12"')
    expect(html).toContain('aria-hidden="true"')
  })
})
