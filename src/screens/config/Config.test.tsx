import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { getDataLayer } from '../../data'
import type { Exercise } from '../../data/types'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Config } from './Config'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
})

const unmountAll = () => act(() => roots.splice(0).forEach((root) => root.unmount()))

function mount(exercise: Exercise = 'abduction', lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen = { id: '', exercise: '' as string | undefined }
  function Spy() {
    const { route } = useNav()
    seen.id = route.id
    seen.exercise = route.exercise
    return null
  }
  const root = createRoot(host)
  roots.push(root)
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang },
        createElement(
          NavProvider,
          { initial: { stack: [{ id: 'mode' }, { id: 'config', exercise }] } },
          createElement(Config, { exercise }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const wheel = host.querySelector<HTMLElement>('[data-part="angle-wheel"]')!
  const value = () => host.querySelector('[data-part="wheel-value"]')?.textContent
  const key = (name: string) =>
    act(() => {
      wheel.dispatchEvent(
        new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }),
      )
    })
  return { host, seen, wheel, value, key }
}

describe('Config', () => {
  it('opens on the wheel at the saved target with the title and caption in Spanish', () => {
    const { host, value } = mount()
    expect(value()).toBe('90°')
    expect(host.textContent).toContain('Ángulo objetivo')
    expect(host.textContent).toContain('Detenciones cada 5°')
  })

  it('speaks English too', () => {
    const { host } = mount('abduction', 'en')
    expect(host.textContent).toContain('Target angle')
    expect(host.textContent).toContain('Detents every 5°')
  })

  it('saves every detent so the target survives a reload', () => {
    const { key, value } = mount()
    key('ArrowRight')
    key('ArrowRight')
    expect(value()).toBe('100°')

    const data = getDataLayer()
    expect(data.settings.get().targetDefault).toBe(100)
    expect(data.routines.get('user-quick-abduction')?.targetAngle).toBe(100)
  })

  it('reopens at the target chosen before', () => {
    const first = mount()
    first.key('End')
    expect(first.value()).toBe('180°')
    unmountAll()

    expect(mount().value()).toBe('180°')
  })

  it('keeps a target for each exercise', () => {
    const abduction = mount('abduction')
    abduction.key('PageUp')
    unmountAll()

    expect(mount('flexion').value()).toBe('120°')
    expect(getDataLayer().routines.get('user-quick-abduction')?.targetAngle).toBe(120)
  })

  it('moves on to the counts of the same exercise with the check mark', () => {
    const { host, seen } = mount('flexion')
    const confirm = host.querySelector<HTMLButtonElement>('[data-part="confirm-button"]')
    expect(confirm?.getAttribute('aria-label')).toBe('Continuar')
    act(() => confirm?.click())
    expect(seen.id).toBe('counts')
    expect(seen.exercise).toBe('flexion')
  })

  it('does not touch storage until the wheel moves', () => {
    mount()
    expect(getDataLayer().routines.get('user-quick-abduction')).toBeNull()
  })
})
