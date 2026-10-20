import { describe, expect, it } from 'vitest'
import { SEED_IDS, SEED_ROUTINES } from './seeds'
import { parseRoutine } from './validators'

describe('seed routines', () => {
  it('ships the four built-in routines', () => {
    expect(SEED_ROUTINES.map((r) => r.targetAngle)).toEqual([90, 120, 150, 60])
    expect(SEED_IDS.size).toBe(4)
  })

  it('has a Spanish and an English name for each', () => {
    for (const routine of SEED_ROUTINES) {
      expect(routine.name.es).not.toBe('')
      expect(routine.name.en).not.toBe('')
      expect(routine.name.es).not.toBe(routine.name.en)
    }
  })

  it('passes the same validation as stored routines', () => {
    for (const routine of SEED_ROUTINES) {
      expect(parseRoutine(routine)).toEqual(routine)
      expect(routine.builtin).toBe(true)
    }
  })
})
