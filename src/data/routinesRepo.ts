import { SEED_IDS, SEED_ROUTINES } from './seeds'
import type { StorageClient } from './storage'
import type { Routine } from './types'
import { parseRoutine, parseRoutines } from './validators'

export interface RoutinesRepo {
  list(): Routine[]
  get(id: string): Routine | null
  save(routine: Routine): boolean
  remove(id: string): boolean
}

const clone = (routine: Routine): Routine => ({ ...routine, name: { ...routine.name } })

export function createRoutinesRepo(storage: StorageClient): RoutinesRepo {
  const userOf = (stored: Routine[] | null): Routine[] =>
    (stored ?? []).filter((routine) => !routine.builtin && !SEED_IDS.has(routine.id))

  const userRoutines = (): Routine[] => userOf(storage.read('routines', parseRoutines))

  const persist = (user: Routine[]) => {
    storage.write('routines', [...SEED_ROUTINES, ...user])
  }

  const list = (): Routine[] => {
    const stored = storage.read('routines', parseRoutines)
    const user = userOf(stored)
    if (stored === null) persist(user)
    return [...SEED_ROUTINES, ...user].map(clone)
  }

  return {
    list,
    get: (id) => list().find((routine) => routine.id === id) ?? null,

    save(routine) {
      const valid = parseRoutine(routine)
      if (!valid || valid.builtin || SEED_IDS.has(valid.id)) return false

      const user = userRoutines()
      const index = user.findIndex((item) => item.id === valid.id)
      if (index === -1) user.push(valid)
      else user[index] = valid
      persist(user)
      return true
    },

    remove(id) {
      if (SEED_IDS.has(id)) return false
      const user = userRoutines()
      const remaining = user.filter((routine) => routine.id !== id)
      if (remaining.length === user.length) return false
      persist(remaining)
      return true
    },
  }
}
