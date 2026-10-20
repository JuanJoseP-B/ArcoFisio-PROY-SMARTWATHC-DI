import { describe, expect, it } from 'vitest'
import { createRepetitionState, repetitionWindow, stepRepetition } from './repetitions'
import type { RepetitionConfig, RepetitionEvent, RepetitionState } from './repetitions'

const CONFIG: RepetitionConfig = { target: 90, tolerance: 2 }
const STEP_MS = 100

function run(angles: readonly number[], config = CONFIG, from?: RepetitionState, t0 = 0) {
  let state = from ?? createRepetitionState()
  const events: RepetitionEvent[] = []
  angles.forEach((angle, i) => {
    const step = stepRepetition(state, { angle, tMs: t0 + i * STEP_MS }, config)
    state = step.state
    events.push(...step.events)
  })
  return { state, events }
}

const ramp = (from: number, to: number, step = 10) => {
  const out: number[] = []
  const dir = Math.sign(to - from)
  for (let a = from; dir > 0 ? a <= to : a >= to; a += dir * step) out.push(a)
  return out
}
const hold = (angle: number, ms: number) => Array<number>(Math.round(ms / STEP_MS)).fill(angle)

describe('repetitionWindow', () => {
  it('uses a return level 30° under the target with a 5° start hysteresis', () => {
    expect(repetitionWindow({ target: 90, tolerance: 2 })).toEqual({
      returnAngle: 60,
      startAngle: 65,
    })
    expect(repetitionWindow({ target: 150, tolerance: 2 })).toEqual({
      returnAngle: 120,
      startAngle: 125,
    })
  })

  it('keeps a valid window for very small targets', () => {
    const { returnAngle, startAngle } = repetitionWindow({ target: 10, tolerance: 2 })
    expect(returnAngle).toBe(5)
    expect(startAngle).toBe(8)
    const tiny = repetitionWindow({ target: 2, tolerance: 2 })
    expect(tiny.startAngle).toBeGreaterThan(tiny.returnAngle)
  })
})

describe('a valid repetition', () => {
  const rep = [...ramp(0, 90), ...hold(90, 1200), ...ramp(80, 0)]

  it('records the peak and the sustained hold', () => {
    const { state } = run(rep)
    expect(state.reps).toEqual([{ peak: 90, held: true }])
    expect(state.hits).toBe(1)
    expect(state.overshoots).toBe(0)
    expect(state.maxAngle).toBe(90)
    expect(state.active).toBe(false)
  })

  it('emits the events in order, once each', () => {
    const { events } = run(rep)
    expect(events).toEqual(['rep-started', 'target-reached', 'held', 'rep-completed'])
  })

  it('counts several repetitions', () => {
    const { state } = run([...rep, ...rep, ...rep])
    expect(state.reps).toHaveLength(3)
    expect(state.hits).toBe(3)
    expect(state.reps.every((r) => r.held)).toBe(true)
  })
})

describe('repetitions that do not count as held', () => {
  it('flags a hold shorter than one second', () => {
    const { state } = run([...ramp(0, 90), ...hold(90, 800), ...ramp(80, 0)])
    expect(state.reps).toEqual([{ peak: 90, held: false }])
    expect(state.hits).toBe(1)
  })

  it('needs exactly one second inside the target band', () => {
    const justShort = run([...ramp(0, 80), 90, 90, 90, 90, 90, 90, 90, 90, 90, 90])
    expect(justShort.events).not.toContain('held')
    const enough = run([...ramp(0, 80), ...hold(90, 1100)])
    expect(enough.events).toContain('held')
  })

  it('requires the hold to be continuous', () => {
    const interrupted = run([
      ...ramp(0, 80),
      ...hold(90, 600),
      88.5 + 10,
      ...hold(90, 600),
      ...ramp(80, 0),
    ])
    expect(interrupted.state.reps).toEqual([{ peak: 98.5, held: false }])
  })

  it('records a rep that never reaches the target', () => {
    const { state } = run([...ramp(0, 70), ...ramp(60, 0)])
    expect(state.reps).toEqual([{ peak: 70, held: false }])
    expect(state.hits).toBe(0)
  })
})

describe('overshoots', () => {
  it('counts one overshoot per repetition and keeps the peak', () => {
    const up = [...ramp(0, 90), 95, 100, 105, 100, 95, ...ramp(90, 0)]
    const { state, events } = run(up)
    expect(state.reps).toEqual([{ peak: 105, held: false }])
    expect(state.overshoots).toBe(1)
    expect(events.filter((e) => e === 'overshoot')).toHaveLength(1)
  })

  it('counts the overshoot again in the next repetition', () => {
    const over = [...ramp(0, 90), 100, ...ramp(90, 0)]
    const { state } = run([...over, ...over])
    expect(state.overshoots).toBe(2)
    expect(state.reps).toHaveLength(2)
  })

  it('can still hold after coming back from an overshoot', () => {
    const { state } = run([...ramp(0, 80), 100, ...hold(90, 1200), ...ramp(80, 0)])
    expect(state.reps).toEqual([{ peak: 100, held: true }])
  })
})

describe('noise and idle behaviour', () => {
  it('ignores jitter near rest', () => {
    const { state, events } = run([0, 1, 0.5, 2, 0, 3, 1, 0])
    expect(events).toEqual([])
    expect(state.reps).toEqual([])
    expect(state.maxAngle).toBe(3)
  })

  it('does not split a repetition on a dip above the return level', () => {
    const { state } = run([...ramp(0, 90), ...hold(90, 1100), 75, 85, 90, ...ramp(80, 0)])
    expect(state.reps).toHaveLength(1)
  })

  it('does not mutate the previous state', () => {
    const first = createRepetitionState()
    stepRepetition(first, { angle: 90, tMs: 0 }, CONFIG)
    expect(first).toEqual(createRepetitionState())
  })

  it('tracks the maximum angle even in an incomplete repetition', () => {
    const { state } = run(ramp(0, 120))
    expect(state.maxAngle).toBe(120)
    expect(state.active).toBe(true)
    expect(state.reps).toEqual([])
  })
})
