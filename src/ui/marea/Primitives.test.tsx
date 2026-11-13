import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from './Button'
import { ContentIn } from './ContentIn'
import { Dial } from './Dial'
import { Hipo } from './Hipo'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { Pill } from './Pill'
import { TideProvider, TideWater } from './Tide'
import { useTide } from './useTide'
import { Water } from './Water'
import { Wordmark } from './Wordmark'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

function mount(node: ReturnType<typeof createElement>) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  act(() => root.render(node))
  return host
}

describe('Hipo', () => {
  it('keeps the proportions of hipo.svg (84 x 138)', () => {
    const html = renderToString(<Hipo width={84} />)
    expect(html).toContain('viewBox="14 2 84 138"')
    expect(html).toContain('height="138"')
  })

  it('is a named image when it has a label and decoration otherwise', () => {
    expect(renderToString(<Hipo label="Hipo" />)).toMatch(/role="img"[^>]*aria-label="Hipo"/)
    expect(renderToString(<Hipo />)).toContain('aria-hidden="true"')
  })

  it('takes every color from the Marea variables', () => {
    expect(renderToString(<Hipo />)).not.toMatch(/#[0-9a-fA-F]{3,6}/)
  })
})

describe('Wordmark', () => {
  it('writes Arco in sans and Fisio in the italic serif', () => {
    const html = renderToString(<Wordmark />)
    expect(html).toContain('Arco')
    expect(html).toContain('Fisio')
  })
})

describe('Water', () => {
  it('puts the surface at the asked level and draws two wave layers', () => {
    const html = renderToString(<Water level={192} />)
    expect(html).toContain('translateY(192px)')
    expect(html).toContain('data-level="192"')
    expect(html.match(/<path/g)).toHaveLength(2)
    expect(html).toContain('M-192 0q48-12 96 0')
    expect(html).toContain('M-192 8q48 12 96 0')
    expect(html).toContain('aria-hidden="true"')
  })
})

describe('Tide', () => {
  function Wants({ level }: { level: number }) {
    useTide(level)
    return null
  }

  it('slides the shared water to the level a screen asks for', () => {
    const host = mount(
      createElement(
        TideProvider,
        { initial: 192 },
        createElement(TideWater),
        createElement(Wants, { level: 338 }),
      ),
    )
    expect(host.querySelector('[data-part="water"]')?.getAttribute('data-level')).toBe('338')
  })

  it('does nothing without a provider', () => {
    const host = mount(
      createElement('div', null, createElement(Wants, { level: 300 }), createElement(TideWater)),
    )
    expect(host.querySelector('[data-part="water"]')).not.toBeNull()
  })
})

describe('ContentIn', () => {
  it('remounts its content when the key changes, to play the entrance again', () => {
    const host = mount(
      createElement(ContentIn, { screenKey: 'a' }, createElement('i', { id: 'x' })),
    )
    const first = host.querySelector('#x')
    act(() =>
      roots[0]!.render(
        createElement(ContentIn, { screenKey: 'b' }, createElement('i', { id: 'x' })),
      ),
    )
    expect(host.querySelector('#x')).not.toBe(first)
  })
})

describe('Dial', () => {
  it('draws the track and the ticks every 10 degrees', () => {
    const html = renderToString(<Dial />)
    expect(html).toContain('M192 362 A170 170 0 0 0 192 22')
    expect(html).toContain('stroke-dasharray="1.6 28.07"')
    expect(html).not.toContain('dial-notch')
    expect(html).not.toContain('dial-marker')
  })

  it('draws the target notch and the live marker where the geometry says', () => {
    const html = renderToString(<Dial target={90} marker={90} />)
    expect(html).toContain('d="M342 192H380"')
    expect(html).toMatch(/cx="362"[^>]*cy="192"/)
  })
})

describe('Button', () => {
  it('is a real button that runs its action', () => {
    const spy = vi.fn()
    const host = mount(
      <Button onPress={spy} minWidth={150}>
        Hola
      </Button>,
    )
    const button = host.querySelector('button')!
    expect(button.type).toBe('button')
    expect(button.style.minWidth).toBe('150px')
    act(() => button.click())
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('does not act when disabled and exposes its variant', () => {
    const spy = vi.fn()
    const host = mount(
      <Button onPress={spy} disabled variant="outline">
        x
      </Button>,
    )
    const button = host.querySelector('button')!
    act(() => button.click())
    expect(spy).not.toHaveBeenCalled()
    expect(button.dataset.variant).toBe('outline')
  })
})

describe('Pill', () => {
  it('puts an icon before the text so the state is not only a color', () => {
    const html = renderToString(
      <Pill tone="amber" icon="alert">
        Texto
      </Pill>,
    )
    expect(html).toContain('data-icon="alert"')
    expect(html).toContain('data-tone="amber"')
  })

  it('announces itself as a status when it is live', () => {
    expect(renderToString(<Pill live>Listo</Pill>)).toContain('role="status"')
    expect(renderToString(<Pill>Listo</Pill>)).not.toContain('role="status"')
  })
})

describe('Icon', () => {
  const names: IconName[] = [
    'measure',
    'sensorOff',
    'play',
    'routines',
    'pain',
    'history',
    'guide',
    'settings',
    'check',
    'alert',
    'plus',
    'minus',
  ]

  it.each(names)('draws %s as decoration with currentColor', (name) => {
    const html = renderToString(<Icon name={name} />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('stroke="currentColor"')
    expect(html).toContain('<path')
  })
})
