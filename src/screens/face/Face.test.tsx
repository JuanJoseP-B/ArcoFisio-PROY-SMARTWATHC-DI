import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Face } from './Face'
import { formatDate, formatTime } from './format'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

// Tuesday 20 October 2026, 14:05 local time.
const when = new Date(2026, 9, 20, 14, 5, 10)
const plain = (text: string | null | undefined) => (text ?? '').replace(/\s/g, ' ')

function mount(lang: 'es' | 'en') {
  const host = document.createElement('div')
  const seen: { route: string } = { route: '' }
  function Spy() {
    seen.route = useNav().route.id
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
          { initial: { stack: [{ id: 'face' }] } },
          createElement(Face, { now: () => when }),
          createElement(Spy),
        ),
      ),
    ),
  )
  return { host, seen }
}

describe('formatTime and formatDate', () => {
  it('writes the time the way each language does', () => {
    expect(plain(formatTime(when, 'es'))).toBe('14:05')
    expect(plain(formatTime(when, 'en'))).toBe('2:05 PM')
  })

  it('writes weekday, day and month in each language', () => {
    expect(formatDate(when, 'es')).toBe('martes, 20 de octubre')
    expect(formatDate(when, 'en')).toBe('Tuesday, October 20')
  })
})

describe('Face', () => {
  it('shows the big time and the date', () => {
    const { host } = mount('es')
    expect(plain(host.querySelector('[data-part="time"]')?.textContent)).toBe('14:05')
    expect(host.querySelector('[data-part="date"]')?.textContent).toBe('martes, 20 de octubre')
  })

  it('is one button that tells its time and what it opens, in the current language', () => {
    const es = mount('es').host.querySelector('button')
    expect(plain(es?.getAttribute('aria-label'))).toBe(
      '14:05, martes, 20 de octubre. Abrir aplicaciones',
    )
    const en = mount('en').host.querySelector('button')
    expect(plain(en?.getAttribute('aria-label'))).toBe('2:05 PM, Tuesday, October 20. Open apps')
  })

  it('opens the launcher when tapped', () => {
    const { host, seen } = mount('es')
    expect(seen.route).toBe('face')
    act(() => host.querySelector('button')?.click())
    expect(seen.route).toBe('launcher')
  })

  it('draws the bead bands behind the time', () => {
    const { host } = mount('es')
    expect(host.querySelector('[data-part="bead-bands"]')).not.toBeNull()
  })
})
