import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { createCalibrationRepo } from '../../data/calibrationRepo'
import { getDataLayer } from '../../data'
import { createStorage } from '../../data/storage'
import { FakeStorage } from '../../data/testStorage'
import { createSensorKit } from '../../sensors/kit'
import { NavProvider } from '../navigation/NavProvider'
import { useNav } from '../navigation/useNav'
import { Pain } from './Pain'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })),
  )
})

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

type Kit = ReturnType<typeof createSensorKit>

const newKit = (): Kit =>
  createSensorKit('sim', createCalibrationRepo(createStorage(new FakeStorage())))

function mount(kit: Kit, lang: 'es' | 'en' = 'es') {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen = { id: '' }
  function Spy() {
    seen.id = useNav().route.id
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
          { initial: { stack: [{ id: 'launcher' }, { id: 'pain' }] } },
          createElement(Pain, { kit }),
          createElement(Spy),
        ),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const text = (name: string) => part(name)?.textContent
  const icon = (name: string) => host.querySelector<HTMLButtonElement>(`[data-icon="${name}"]`)
  const pill = () => host.querySelector<HTMLButtonElement>('[data-part="pill-button"]')!
  const chip = () => part('zone-chip')
  const move = (angle: number) =>
    act(() => {
      for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(angle)
    })
  const press = () => act(() => pill().click())
  return { host, seen, part, text, icon, pill, chip, move, press }
}

describe('Pain: with no arc saved', () => {
  it('asks to move the arm to where the pain starts', () => {
    const { text, pill, chip, part, icon } = mount(newKit())
    expect(text('pain-note')).toBe('Mueve el brazo hasta donde empieza el dolor')
    expect(pill().textContent).toContain('Empieza el dolor')
    expect(chip()).toBeNull()
    expect(part('pain-band')).toBeNull()
    expect(icon('trash')).toBeNull()
  })

  it('shows the live angle on the ring without a target marker', () => {
    const { text, part, move } = mount(newKit())
    move(40)
    expect(text('angle')).toBe('40°')
    expect(part('goniometer-ring')).not.toBeNull()
    expect(part('target')).toBeNull()
  })
})

describe('Pain: marking the arc', () => {
  it('grows the band from the first tap to the live angle', () => {
    const { text, pill, part, move, press } = mount(newKit())
    move(70)
    press()
    expect(part('pain')?.dataset.marking).toBe('true')
    expect(text('pain-note')).toBe('Sigue hasta donde termina el dolor')
    expect(pill().textContent).toContain('Termina el dolor')

    move(95)
    expect(part('pain-band')?.getAttribute('stroke-dasharray')).toBe(
      `${((25 * 1030.44) / 360).toFixed(2)} 1030.44`,
    )
  })

  it('saves the arc on the second tap and shows its range', () => {
    const { text, part, move, press } = mount(newKit())
    move(70)
    press()
    move(110)
    press()

    expect(getDataLayer().painArc.get()).toEqual({ from: 70, to: 110 })
    expect(part('pain')?.dataset.marking).toBe('false')
    expect(text('pain-note')).toBe('Dolor · 70–110°')
  })

  it('saves the arc in order when the arm came down instead of up', () => {
    const { move, press } = mount(newKit())
    move(110)
    press()
    move(70)
    press()
    expect(getDataLayer().painArc.get()).toEqual({ from: 70, to: 110 })
  })

  it('does not save an arc that is too short and says so', () => {
    const { text, move, press } = mount(newKit())
    move(70)
    press()
    move(72)
    press()
    expect(getDataLayer().painArc.get()).toBeNull()
    expect(text('pain-note')).toBe('Muy corto. Mueve más el brazo')
  })

  it('drops the mark when it is cancelled', () => {
    const { part, icon, move, press } = mount(newKit())
    move(70)
    press()
    act(() => icon('reset')?.click())
    expect(part('pain')?.dataset.marking).toBe('false')
    expect(getDataLayer().painArc.get()).toBeNull()
  })

  it('replaces the saved arc with a new one', () => {
    getDataLayer().painArc.set({ from: 30, to: 50 })
    const { move, press } = mount(newKit())
    move(80)
    press()
    move(120)
    press()
    expect(getDataLayer().painArc.get()).toEqual({ from: 80, to: 120 })
  })
})

describe('Pain: with an arc saved', () => {
  beforeEach(() => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
  })

  it('draws the band and both ends from the start', () => {
    const { part, host, text } = mount(newKit())
    expect(part('pain-band')).not.toBeNull()
    expect(host.querySelectorAll('[data-part="pain-edge"]')).toHaveLength(2)
    expect(text('pain-note')).toBe('Dolor · 70–110°')
  })

  it('says it is pain-free outside the arc and in pain inside it', () => {
    const { chip, part, move } = mount(newKit())
    move(30)
    expect(chip()?.textContent).toBe('Sin dolor')
    expect(part('goniometer-ring')?.dataset.zone).toBeUndefined()

    move(90)
    expect(chip()?.textContent).toBe('Dolor')
    expect(part('goniometer-ring')?.dataset.zone).toBe('pain')
  })

  it('clears the arc with the trash button', () => {
    const { part, icon, text } = mount(newKit())
    act(() => icon('trash')?.click())
    expect(getDataLayer().painArc.get()).toBeNull()
    expect(part('pain-band')).toBeNull()
    expect(text('pain-note')).toBe('Mueve el brazo hasta donde empieza el dolor')
  })
})

describe('Pain: navigation and language', () => {
  it('goes back to the launcher', () => {
    const { icon, seen } = mount(newKit())
    act(() => icon('back')?.click())
    expect(seen.id).toBe('launcher')
  })

  it('speaks English', () => {
    getDataLayer().painArc.set({ from: 70, to: 110 })
    const { text, pill } = mount(newKit(), 'en')
    expect(text('pain-note')).toBe('Pain · 70–110°')
    expect(pill().textContent).toContain('Pain starts')
  })

  it('walks through the sensor steps first when there is no reference', () => {
    const kit = newKit()
    kit.tracker.setCalibration(null)
    const { part } = mount(kit)
    expect(part('pain')?.dataset.mode).toBe('steps')
    expect(part('sensor-steps')?.dataset.step).toBe('calibrate')
  })
})
