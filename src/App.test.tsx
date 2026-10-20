import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { getDataLayer } from './data'
import { getFeedback } from './feedback'
import { getSensorKit } from './sensors/kit'
import { PRESS_DELAY_MS } from './ui/pressTiming'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const open = (search: string) => window.history.replaceState(null, '', `/${search}`)

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  open('')
  vi.useRealTimers()
})

function mount() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(createElement(App)))
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const click = (el: Element | null) => act(() => (el as HTMLElement | null)?.click())
  const unmount = () => {
    act(() => root.unmount())
    host.remove()
  }
  return { host, part, click, unmount }
}

describe('App', () => {
  it('opens on the intro inside the radial transition', () => {
    const html = renderToString(<App />)
    expect(html).toContain('data-part="radial-transition"')
    expect(html).toContain('data-part="intro"')
    expect(html).toContain('ARCO')
    expect(html).toContain('FISIO')
    expect(html).not.toContain('data-part="simulator-panel"')
  })

  it('goes from the intro to the face, the launcher, the exercise, its configuration and a live session', () => {
    open('?sim=1')
    getDataLayer().settings.update({ firstRunDone: true })
    const { host, part, click, unmount } = mount()

    click(part('intro-skip'))
    expect(part('face')).not.toBeNull()
    click(part('face'))
    click(host.querySelector('[data-cell="session"]'))
    expect(part('mode-select')).not.toBeNull()

    const pressPill = () => {
      click(host.querySelector('[data-part="pill-button"]'))
      act(() => {
        vi.advanceTimersByTime(PRESS_DELAY_MS)
      })
    }
    pressPill()
    expect(part('angle-wheel')).not.toBeNull()
    click(part('confirm-button'))
    expect(part('counts')).not.toBeNull()
    pressPill()
    expect(part('session')).not.toBeNull()
    expect(part('goniometer-ring')).not.toBeNull()
    unmount()
  })

  it('remembers the language chosen on the first run when the app is reopened', () => {
    open('?sim=1')
    const first = mount()
    first.click(first.part('intro-skip'))
    expect(first.part('language-select')).not.toBeNull()

    first.click(first.host.querySelectorAll('[data-part="pill-button"]')[1] ?? null)
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(first.part('sensor-setup')).not.toBeNull()
    first.unmount()

    expect(getDataLayer().settings.get().lang).toBe('en')
    expect(renderToString(<App />)).toContain('Every degree counts')
  })

  it('keeps the target chosen on the wheel after closing and reopening', () => {
    open('?sim=1')
    getDataLayer().settings.update({ firstRunDone: true })

    const toWheel = () => {
      const app = mount()
      app.click(app.part('intro-skip'))
      app.click(app.part('face'))
      app.click(app.host.querySelector('[data-cell="session"]'))
      app.click(app.host.querySelector('[data-part="pill-button"]'))
      act(() => {
        vi.advanceTimersByTime(PRESS_DELAY_MS)
      })
      return app
    }

    const first = toWheel()
    // The wheel is scrolled rather than keyed: a key press would also unlock the audio.
    act(() => {
      for (let notch = 0; notch < 3; notch += 1) {
        first
          .part('angle-wheel')
          ?.dispatchEvent(
            new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }),
          )
      }
    })
    expect(first.part('wheel-value')?.textContent).toBe('105°')
    first.unmount()

    const reopened = toWheel()
    expect(reopened.part('wheel-value')?.textContent).toBe('105°')
    reopened.unmount()
  })

  it('makes a routine, plays it through with its rest, and finds it in the library after reopening', () => {
    open('?sim=1')
    getDataLayer().settings.update({ lang: 'es', firstRunDone: true })

    const openLibrary = () => {
      const app = mount()
      app.click(app.part('intro-skip'))
      app.click(app.part('face'))
      app.click(app.host.querySelector('[data-cell="routines"]'))
      return app
    }
    const pressLabel = (app: ReturnType<typeof mount>, label: string) => {
      const pill = [
        ...app.host.querySelectorAll<HTMLButtonElement>('[data-part="pill-button"]'),
      ].find((button) => button.textContent === label)
      app.click(pill ?? null)
      act(() => {
        vi.advanceTimersByTime(PRESS_DELAY_MS)
      })
    }
    const tap = (app: ReturnType<typeof mount>, row: number, action: string, times: number) => {
      const stepper = app.host.querySelectorAll('[data-part="stepper"]')[row]
      for (let i = 0; i < times; i += 1) {
        app.click(stepper?.querySelector(`[data-action="${action}"]`) ?? null)
      }
    }
    const move = (angle: number) =>
      act(() => {
        for (let i = 0; i < 80; i += 1) getSensorKit().simulated?.setAngle(angle)
      })
    const wait = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    /** Reach the target, hold it for over a second, and come back down. */
    const doRep = () => {
      move(90)
      wait(100)
      wait(1200)
      move(5)
      wait(200)
    }

    // Make it: one repetition, two sets, a 5 s rest.
    const first = openLibrary()
    first.click(first.host.querySelector('[data-part="routine-card"]'))
    expect(first.part('builder')).not.toBeNull()
    act(() => {
      const input = first.part('builder-name') as HTMLInputElement
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        input,
        'Mi circuito',
      )
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    tap(first, 2, 'decrease', 9)
    tap(first, 3, 'decrease', 1)
    tap(first, 4, 'decrease', 5)
    pressLabel(first, 'Guardar')

    const titles = () =>
      [...first.host.querySelectorAll('[data-part="card-title"]')].map((el) => el.textContent)
    expect(titles()).toContain('Mi circuito')

    // Play it: the first set, a rest, the second set.
    const card = [...first.host.querySelectorAll('[data-part="routine-card"]')].find(
      (el) => el.querySelector('[data-part="card-title"]')?.textContent === 'Mi circuito',
    )
    first.click(card ?? null)
    expect(first.part('detail-name')?.textContent).toBe('Mi circuito')
    pressLabel(first, 'Iniciar')
    expect(first.part('player')?.dataset.phase).toBe('set')

    doRep()
    expect(first.part('player')?.dataset.phase).toBe('rest')
    expect(first.part('rest-time')?.textContent).toBe('0:05')

    wait(5200)
    expect(first.part('rest-time')?.textContent).toBe('¡Listo!')
    wait(1400)
    expect(first.part('player')?.dataset.phase).toBe('set')
    expect(first.part('set-caption')?.textContent).toBe('Serie 2 de 2')

    doRep()
    expect(first.part('done-view')?.dataset.outcome).toBe('completed')
    expect(getDataLayer().sessions.last()).toMatchObject({
      routineId: getDataLayer()
        .routines.list()
        .find((r) => r.name.es === 'Mi circuito')?.id,
      hits: 2,
    })
    expect(getDataLayer().sessions.last()?.reps).toHaveLength(2)
    first.unmount()

    // Reopen the app: the routine is still in the library.
    const reopened = openLibrary()
    expect(
      [...reopened.host.querySelectorAll('[data-part="card-title"]')].map((el) => el.textContent),
    ).toContain('Mi circuito')
    reopened.unmount()
  })

  it('marks 70-110 as painful, warns in a session on entering it, and changes the guide with the saved data', () => {
    open('?sim=1')
    getDataLayer().settings.update({ lang: 'es', firstRunDone: true })

    const openApp = () => {
      const app = mount()
      app.click(app.part('intro-skip'))
      app.click(app.part('face'))
      return app
    }
    const move = (angle: number) =>
      act(() => {
        for (let i = 0; i < 80; i += 1) getSensorKit().simulated?.setAngle(angle)
      })
    const wait = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    const guideTip = (app: ReturnType<typeof mount>) => app.part('guide-tip')?.textContent
    const icon = (app: ReturnType<typeof mount>, name: string) =>
      app.host.querySelector(`[data-part="icon-button"][data-icon="${name}"]`)

    // With no sessions the guide invites the first one.
    const before = openApp()
    before.click(before.host.querySelector('[data-cell="guide"]'))
    expect(before.part('guide')?.dataset.tip).toBe('first')
    before.unmount()

    // Mark the arc: pain starts at 70 degrees and ends at 110.
    move(0)
    wait(100)
    const marking = openApp()
    marking.click(marking.host.querySelector('[data-cell="pain"]'))
    expect(marking.part('pain')?.dataset.mode).toBe('range')
    move(70)
    wait(100)
    marking.click(marking.host.querySelector('[data-part="pill-button"]'))
    move(110)
    wait(100)
    marking.click(marking.host.querySelector('[data-part="pill-button"]'))
    expect(getDataLayer().painArc.get()).toEqual({ from: 70, to: 110 })
    expect(marking.part('pain-note')?.textContent).toBe('Dolor · 70–110°')
    marking.unmount()

    // Reopened, a session shows the band and warns on entering the arc.
    move(0)
    wait(100)
    const session = openApp()
    session.click(session.host.querySelector('[data-cell="session"]'))
    const pill = () => session.host.querySelector('[data-part="pill-button"]')
    const pressPill = () => {
      session.click(pill())
      wait(PRESS_DELAY_MS)
    }
    pressPill()
    session.click(session.part('confirm-button'))
    pressPill()
    expect(session.part('pain-band')).not.toBeNull()

    move(60)
    wait(100)
    expect(session.part('zone-chip')?.textContent).not.toContain('Dolor')
    move(80)
    wait(100)
    expect(session.part('zone-chip')?.textContent).toBe('Dolor · 70–110°')

    // End the set early: the visit to the painful arc is kept with the session.
    session.click(icon(session, 'pause'))
    session.click(icon(session, 'stop'))
    expect(session.part('done-view')).not.toBeNull()
    expect(getDataLayer().sessions.last()?.painEntries).toBe(1)
    session.unmount()

    // The guide now speaks of the pain, not of the first session.
    const after = openApp()
    after.click(after.host.querySelector('[data-cell="guide"]'))
    expect(after.part('guide')?.dataset.tip).toBe('pain')
    expect(guideTip(after)).toBe('Entraste 1 vez al arco doloroso. Pasa más despacio por ahí.')
    after.unmount()
  })

  it('ends a session on the summary and, after three sessions, shows the change with its sign', () => {
    open('?sim=1')
    getDataLayer().settings.update({ lang: 'es', firstRunDone: true })

    // Two sessions saved before: 80° and then 90°.
    const routineId = getDataLayer().routines.list()[0]!.id
    const saved = (id: string, maxAngle: number, minute: number) =>
      getDataLayer().sessions.add({
        id,
        routineId,
        startedAt: new Date(2026, 9, 1, 10, minute).toISOString(),
        endedAt: new Date(2026, 9, 1, 10, minute + 5).toISOString(),
        maxAngle,
        hits: 1,
        overshoots: 0,
        painEntries: 0,
        reps: [{ peak: maxAngle, held: true }],
      })
    expect(saved('a', 80, 0)).toBe(true)
    expect(saved('b', 90, 10)).toBe(true)

    const move = (angle: number) =>
      act(() => {
        for (let i = 0; i < 80; i += 1) getSensorKit().simulated?.setAngle(angle)
      })
    const wait = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    move(0)
    wait(100)

    const app = mount()
    app.click(app.part('intro-skip'))
    app.click(app.part('face'))
    app.click(app.host.querySelector('[data-cell="session"]'))
    const pressPill = () => {
      app.click(app.host.querySelector('[data-part="pill-button"]'))
      wait(PRESS_DELAY_MS)
    }
    pressPill()
    app.click(app.part('confirm-button'))
    pressPill()

    // The third session reaches 85°, five degrees less than the one before.
    move(85)
    wait(100)
    const icon = (name: string) =>
      app.host.querySelector(`[data-part="icon-button"][data-icon="${name}"]`)
    app.click(icon('pause'))
    app.click(icon('stop'))
    expect(app.part('done-view')).not.toBeNull()
    expect(getDataLayer().sessions.last()?.maxAngle).toBeCloseTo(85, 0)

    // The way out of the workout is the summary: today's reach and the setback with its sign.
    app.click(app.part('done-view')?.querySelector('button') ?? null)
    wait(PRESS_DELAY_MS)
    expect(app.part('summary')).not.toBeNull()
    expect(app.part('summary-label')?.textContent).toBe('Rango máximo de hoy')
    expect(app.part('summary-max')?.textContent).toBe('85°')
    expect(app.part('zone-chip')?.textContent).toBe('−5° vs. sesión anterior')

    // The history shows the three sessions, newest first, each against the one before it.
    app.click(icon('history'))
    const rows = [...app.host.querySelectorAll('[data-part="history-row"]')]
    expect(rows.map((row) => row.querySelector('[data-part="history-max"]')?.textContent)).toEqual([
      '85°',
      '90°',
      '80°',
    ])
    expect(
      rows.map((row) => row.querySelector('[data-part="history-change"]')?.textContent ?? null),
    ).toEqual(['−5°', '+10°', null])

    // Back from the history to the summary, then to the launcher.
    app.click(app.host.querySelector('[data-part="back-button"]'))
    expect(app.part('summary')).not.toBeNull()
    app.click(icon('back'))
    expect(app.part('hex-launcher')).not.toBeNull()
    app.unmount()
  })

  it('switches to English from Ajustes without reloading and every app speaks it, keeping the choice', () => {
    open('?sim=1')
    getDataLayer().settings.update({ lang: 'es', firstRunDone: true })
    const wait = (ms: number) =>
      act(() => {
        vi.advanceTimersByTime(ms)
      })
    const app = mount()
    app.click(app.part('intro-skip'))
    app.click(app.part('face'))
    const cell = (id: string) => app.host.querySelector(`[data-cell="${id}"]`)
    const back = () =>
      app.click(app.host.querySelector('[data-part="back-button"], [data-icon="back"]'))
    const screenText = () => app.part('screen')?.textContent ?? ''
    // A message that was never translated shows as its key, like "zone.far" or "guide.first".
    const RAW_KEY = /\b[a-z]+\.[a-zA-Z]+\b/

    // Ajustes -> language: the whole app switches at once.
    app.click(cell('settings'))
    expect(app.part('settings')?.querySelector('h1')?.textContent).toBe('Ajustes')
    app.click(app.host.querySelector('[data-part="stepper"] [data-action="increase"]'))
    expect(app.part('settings')?.querySelector('h1')?.textContent).toBe('Settings')
    expect(getDataLayer().settings.get().lang).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    back()

    // Every app opens in English with no raw key showing.
    const titles = new Map([
      ['measure', 'Measure range'],
      ['routines', 'Routines'],
      ['summary', 'Summary'],
      ['pain', 'Painful arc'],
      ['guide', 'AI Guide'],
      ['settings', 'Settings'],
    ])
    for (const [id, title] of titles) {
      app.click(cell(id))
      wait(1500)
      expect(screenText(), id).not.toMatch(RAW_KEY)
      if (id !== 'measure' && id !== 'pain') {
        expect(app.part('screen')?.querySelector('h1')?.textContent, id).toBe(title)
      }
      back()
    }
    expect(app.part('hex-launcher')?.textContent).toContain('Summary')
    app.unmount()

    // Reopened, the app is still in English.
    expect(renderToString(<App />)).toContain('Every degree counts')
  })

  it('shows the simulator only with ?sim=1 and keeps it out of the watch circle', () => {
    const plain = mount()
    expect(plain.part('simulator-panel')).toBeNull()
    plain.unmount()

    open('?sim=1')
    const sim = mount()
    const panel = sim.part('simulator-panel')
    expect(panel).not.toBeNull()
    expect(sim.part('screen')?.contains(panel)).toBe(false)
    sim.unmount()
  })

  it('unlocks the audio on the first touch of the page', async () => {
    const { unmount } = mount()
    expect(getFeedback().audio.state).toBe('locked')

    // jsdom has no Web Audio, so the attempt ends as "unsupported": it did try on the gesture.
    await act(async () => {
      document.dispatchEvent(new Event('pointerdown'))
    })
    expect(getFeedback().audio.state).toBe('unsupported')
    unmount()
  })
})
