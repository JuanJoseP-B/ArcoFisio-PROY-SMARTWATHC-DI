import { describe, expect, it } from 'vitest'
import { SEED_ROUTINES } from '../../data/seeds'
import type { Routine } from '../../data/types'
import { HEX_CELLS } from '../../ui/hexLayout'
import { routeForLauncher, routineForExercise } from './targets'

describe('routeForLauncher', () => {
  it('sends Session through the exercise selector', () => {
    expect(routeForLauncher('session')).toEqual({ id: 'mode' })
  })

  it('opens every other app on its own screen', () => {
    for (const id of ['measure', 'routines', 'summary', 'pain', 'guide', 'settings'] as const) {
      expect(routeForLauncher(id)).toEqual({ id })
    }
  })

  it('leads every launcher cell somewhere', () => {
    for (const cell of HEX_CELLS) expect(routeForLauncher(cell.id).id).toBeTruthy()
  })
})

describe('routineForExercise', () => {
  it('finds the first built-in routine of each exercise', () => {
    expect(routineForExercise(SEED_ROUTINES, 'abduction')?.id).toBe('builtin-abduction-90')
    expect(routineForExercise(SEED_ROUTINES, 'flexion')?.id).toBe('builtin-flexion-150')
  })

  it('returns null when no routine has that exercise', () => {
    const onlyAbduction: Routine[] = SEED_ROUTINES.filter((r) => r.exercise === 'abduction')
    expect(routineForExercise(onlyAbduction, 'flexion')).toBeNull()
    expect(routineForExercise([], 'abduction')).toBeNull()
  })
})
