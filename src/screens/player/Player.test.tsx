import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../app/I18nProvider'
import { createCalibrationRepo } from '../../data/calibrationRepo'
import { createStorage } from '../../data/storage'
import { FakeStorage } from '../../data/testStorage'
import type { Routine, Session } from '../../data/types'
import type { PainArc } from '../../domain/zones'
import { createSensorKit } from '../../sensors/kit'
import { PRESS_DELAY_MS } from '../../ui/pressTiming'
import { READY_HOLD_MS, Player } from './Player'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []
let frames = new Map<number, FrameRequestCallback>()
let nextId = 1
let clock = 0

/** Runs the pending animation frames at `clock + advance`. */
function frame(advance: number) {
  clock += advance
  const callbacks = [...frames.values()]
  frames = new Map()
  act(() => callbacks.forEach((cb) => cb(clock)))
}

beforeEach(() => {
  frames = new Map()
  nextId = 1
  clock = 1000
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(nextId, cb)
    return nextId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
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
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const newKit = () => createSensorKit('sim', createCalibrationRepo(createStorage(new FakeStorage())))

const routine: Routine = {
  id: 'r-test',
  name: { es: 'Prueba', en: 'Test' },
  exercise: 'abduction',
  targetAngle: 90,
  tolerance: 2,
  reps: 1,
  sets: 2,
  restSec: 2,
  builtin: false,
}

function mount(options: { routine?: Routine; lang?: 'es' | 'en'; painArc?: PainArc } = {}) {
  const kit = newKit()
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  roots.push(root)
  const finished: (Session | null)[] = []
  const onExit = vi.fn()
  act(() =>
    root.render(
      createElement(
        I18nProvider,
        { lang: options.lang ?? 'es' },
        createElement(Player, {
          routine: options.routine ?? routine,
          painArc: options.painArc ?? null,
          kit,
          onFinish: (session: Session | null) => finished.push(session),
          onExit,
        }),
      ),
    ),
  )
  const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  const control = (icon: string) =>
    host.querySelector<HTMLButtonElement>(`[data-part="icon-button"][data-icon="${icon}"]`)
  const press = (icon: string) => act(() => control(icon)?.click())
  const moveTo = (angle: number) =>
    act(() => {
      for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(angle)
    })
  /** One full repetition: reach the target, hold it for over a second, come back down. */
  const doRep = () => {
    moveTo(90)
    frame(100)
    frame(600)
    frame(600)
    moveTo(5)
    frame(100)
  }
  /** Lets a rest run out and its "ready" moment pass. */
  const sitOutRest = (seconds = 2) => {
    frame(16)
    frame(seconds * 1000 + 100)
    // The ready hold starts counting from its first frame.
    frame(16)
    frame(READY_HOLD_MS)
  }
  return { host, part, control, press, moveTo, doRep, sitOutRest, finished, onExit }
}

const phase = (m: ReturnType<typeof mount>) => m.part('player')?.dataset.phase

describe('Player', () => {
  it('draws the saved painful arc on the live set, and names it when the arm is inside', () => {
    const { part, moveTo, host } = mount({ painArc: { from: 40, to: 60 } })
    expect(part('pain-band')).not.toBeNull()
    moveTo(50)
    frame(100)
    expect(host.querySelector('[data-part="zone-chip"]')?.textContent).toBe('Dolor · 40–60°')
  })

  it('opens on the first set, live, with a pause button and the set under the counter', () => {
    const m = mount()
    expect(phase(m)).toBe('set')
    expect(m.part('session')).not.toBeNull()
    expect(m.part('set-caption')?.textContent).toBe('Serie 1 de 2')
    expect(m.control('pause')).not.toBeNull()
  })

  it('leaves the set caption out when the routine has a single set', () => {
    const m = mount({ routine: { ...routine, sets: 1 } })
    expect(m.part('set-caption')).toBeNull()
  })

  it('rests when a set has all its repetitions, showing the clock', () => {
    const m = mount()
    m.doRep()
    expect(phase(m)).toBe('rest')
    expect(m.part('rest-label')?.textContent).toBe('Descanso')
    expect(m.part('rest-time')?.textContent).toBe('0:02')
  })

  it('counts the rest down, says it is ready, and starts the next set by itself', () => {
    const m = mount()
    m.doRep()
    frame(16)
    frame(1000)
    expect(m.part('rest-time')?.textContent).toBe('0:01')

    frame(1100)
    expect(m.part('rest-time')?.textContent).toBe('¡Listo!')
    expect(m.part('rest-label')?.textContent).toBe('Siguiente serie')
    expect(phase(m)).toBe('rest')

    frame(100)
    frame(READY_HOLD_MS)
    expect(phase(m)).toBe('set')
    expect(m.part('set-caption')?.textContent).toBe('Serie 2 de 2')
  })

  it('ends after the last set, completed, and reports the session once', () => {
    const m = mount()
    m.doRep()
    m.sitOutRest()
    m.doRep()

    expect(phase(m)).toBe('done')
    expect(m.part('done-view')?.dataset.outcome).toBe('completed')
    expect(m.part('done-reps')?.textContent).toBe('2 repeticiones')
    expect(m.finished).toHaveLength(1)
    expect(m.finished[0]).toMatchObject({ routineId: 'r-test', hits: 2 })
    expect(m.finished[0]?.reps).toHaveLength(2)

    frame(100)
    expect(m.finished).toHaveLength(1)
  })

  it('has no rest after the last set and none at all when the routine rests for 0 s', () => {
    const m = mount({ routine: { ...routine, restSec: 0 } })
    m.doRep()
    expect(phase(m)).toBe('set')
    expect(m.part('set-caption')?.textContent).toBe('Serie 2 de 2')
  })

  it('shows the progress ring and the set pills while paused, and stops counting', () => {
    const m = mount({ routine: { ...routine, reps: 3 } })
    m.press('pause')

    expect(m.part('progress-view')).not.toBeNull()
    expect(m.part('step-ring')?.getAttribute('data-total')).toBe('3')
    expect(m.part('set-label')?.textContent).toBe('Serie 1 de 2')
    expect(m.part('set-pills')?.querySelectorAll('[data-state]')).toHaveLength(2)
    expect(m.part('player')?.dataset.paused).toBe('true')

    m.doRep()
    expect(m.part('progress-count')?.textContent).toBe('0/3')
    expect(m.control('play')).not.toBeNull()
  })

  it('resumes where it was and keeps counting', () => {
    const m = mount({ routine: { ...routine, reps: 3 } })
    m.doRep()
    m.press('pause')
    expect(m.part('progress-count')?.textContent).toBe('1/3')

    m.press('play')
    expect(m.part('session')).not.toBeNull()
    expect(m.part('reps')?.textContent).toContain('1 de 3')
  })

  it('skips ahead to the rest from a set, keeping the repetitions already done', () => {
    const m = mount({ routine: { ...routine, reps: 3 } })
    m.doRep()
    m.press('pause')
    m.press('next')

    expect(phase(m)).toBe('rest')
    expect(m.part('player')?.dataset.paused).toBe('false')
  })

  it('skips the rest into the next set', () => {
    const m = mount()
    m.doRep()
    m.press('next')
    expect(phase(m)).toBe('set')
    expect(m.part('set-caption')?.textContent).toBe('Serie 2 de 2')
  })

  it('treats skipping the last set as finishing early', () => {
    const m = mount()
    m.doRep()
    m.sitOutRest()
    m.press('pause')
    m.press('next')

    expect(phase(m)).toBe('done')
    expect(m.part('done-view')?.dataset.outcome).toBe('stopped')
    expect(m.part('done-reps')?.textContent).toBe('1 repeticiones')
  })

  it('freezes the rest clock while paused and picks it up again', () => {
    const m = mount()
    m.doRep()
    frame(16)
    frame(500)
    m.press('pause')
    expect(m.part('rest-label')?.textContent).toBe('En pausa')
    const frozen = m.part('rest-time')?.textContent

    frame(5000)
    frame(5000)
    expect(m.part('rest-time')?.textContent).toBe(frozen)
    expect(phase(m)).toBe('rest')

    m.press('play')
    expect(m.part('rest-label')?.textContent).toBe('Descanso')
  })

  it('finishes when asked, keeping what the set in progress counted', () => {
    const m = mount({ routine: { ...routine, reps: 3 } })
    m.doRep()
    m.press('pause')
    m.press('stop')

    expect(phase(m)).toBe('done')
    expect(m.part('done-view')?.dataset.outcome).toBe('stopped')
    expect(m.part('done-reps')?.textContent).toBe('1 repeticiones')
    expect(m.finished[0]?.reps).toHaveLength(1)
  })

  it('keeps nothing when it is finished before the arm moved', () => {
    const m = mount()
    m.press('pause')
    m.press('stop')
    expect(phase(m)).toBe('done')
    expect(m.finished).toEqual([null])
  })

  it('leaves through the exit button of the end screen', () => {
    const m = mount()
    m.press('pause')
    m.press('stop')
    vi.useFakeTimers()
    act(() => m.part('done-view')?.querySelector('button')?.click())
    act(() => {
      vi.advanceTimersByTime(PRESS_DELAY_MS)
    })
    expect(m.onExit).toHaveBeenCalledTimes(1)
  })

  it('speaks English', () => {
    const m = mount({ lang: 'en' })
    expect(m.part('set-caption')?.textContent).toBe('Set 1 of 2')
    m.doRep()
    expect(m.part('rest-label')?.textContent).toBe('Rest')
    m.sitOutRest()
    m.press('pause')
    m.press('stop')
    expect(m.part('done-view')?.querySelector('h1')?.textContent).toBe('Routine finished')
  })
})
