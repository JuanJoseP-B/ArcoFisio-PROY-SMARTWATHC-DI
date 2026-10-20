import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const open = (search: string) => window.history.replaceState(null, '', `/${search}`)

afterEach(() => open(''))

describe('App', () => {
  it('opens on the intro inside the radial transition', () => {
    const html = renderToString(<App />)
    expect(html).toContain('data-part="radial-transition"')
    expect(html).toContain('data-part="intro"')
    expect(html).toContain('ARCO')
    expect(html).toContain('FISIO')
  })

  it('opens the sensor probe with ?probe=1 instead of the intro', () => {
    open('?probe=1&sim=1')
    const host = document.createElement('div')
    const root = createRoot(host)
    act(() => root.render(createElement(App)))

    expect(host.querySelector('[data-part="radial-transition"]')).not.toBeNull()
    expect(host.querySelector('[data-part="intro"]')).toBeNull()
    act(() => root.unmount())
  })
})
