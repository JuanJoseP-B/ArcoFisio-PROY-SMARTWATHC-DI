import { describe, expect, it } from 'vitest'
import { canGoBack, currentRoute, initialNav, navReducer, routeKey, sameRoute } from './stack'
import type { NavAction, NavState, Route } from './stack'

const run = (actions: NavAction[], from: NavState = initialNav) => actions.reduce(navReducer, from)

const ids = (state: NavState) => state.stack.map((route) => route.id)
const push = (route: Route): NavAction => ({ type: 'push', route })

describe('navReducer', () => {
  it('starts on the intro', () => {
    expect(ids(initialNav)).toEqual(['intro'])
    expect(canGoBack(initialNav)).toBe(false)
  })

  it('pushes screens and goes back one at a time', () => {
    const state = run([
      { type: 'replace', route: { id: 'face' } },
      push({ id: 'launcher' }),
      push({ id: 'mode' }),
    ])
    expect(ids(state)).toEqual(['face', 'launcher', 'mode'])
    expect(currentRoute(state).id).toBe('mode')

    expect(ids(navReducer(state, { type: 'back' }))).toEqual(['face', 'launcher'])
  })

  it('does nothing when going back at the bottom of the stack', () => {
    const state = run([{ type: 'replace', route: { id: 'face' } }])
    expect(navReducer(state, { type: 'back' })).toBe(state)
  })

  it('ignores a repeated push of the screen already on show (double tap)', () => {
    const state = run([push({ id: 'launcher' })])
    expect(navReducer(state, push({ id: 'launcher' }))).toBe(state)
  })

  it('treats the same screen with another routine as a different route', () => {
    const state = run([push({ id: 'session', routineId: 'a' })])
    expect(ids(navReducer(state, push({ id: 'session', routineId: 'b' })))).toEqual([
      'intro',
      'session',
      'session',
    ])
  })

  it('replaces only the screen on show, so back never returns to the intro', () => {
    const state = run([{ type: 'replace', route: { id: 'face' } }])
    expect(ids(state)).toEqual(['face'])
    expect(canGoBack(state)).toBe(false)

    const deeper = run(
      [push({ id: 'launcher' }), { type: 'replace', route: { id: 'settings' } }],
      state,
    )
    expect(ids(deeper)).toEqual(['face', 'settings'])
  })

  it('resets to a single screen', () => {
    const state = run([
      push({ id: 'launcher' }),
      push({ id: 'pain' }),
      { type: 'reset', route: { id: 'face' } },
    ])
    expect(ids(state)).toEqual(['face'])
  })

  it('never mutates the previous state', () => {
    const before = run([push({ id: 'launcher' })])
    const snapshot = [...before.stack]
    navReducer(before, push({ id: 'pain' }))
    navReducer(before, { type: 'back' })
    expect(before.stack).toEqual(snapshot)
  })
})

describe('routes', () => {
  it('compares routes by screen and routine', () => {
    expect(sameRoute({ id: 'session', routineId: 'x' }, { id: 'session', routineId: 'x' })).toBe(
      true,
    )
    expect(sameRoute({ id: 'session', routineId: 'x' }, { id: 'session' })).toBe(false)
    expect(
      sameRoute({ id: 'config', exercise: 'flexion' }, { id: 'config', exercise: 'abduction' }),
    ).toBe(false)
  })

  it('builds a key that changes with the routine', () => {
    expect(routeKey({ id: 'launcher' })).toBe('launcher')
    expect(routeKey({ id: 'session', routineId: 'abc' })).toBe('session:abc')
    expect(routeKey({ id: 'config', exercise: 'flexion' })).toBe('config:flexion')
  })
})
