import type { Exercise, Routine } from '../../data/types'
import type { LauncherId } from '../../ui/hexLayout'
import type { Route } from './stack'

/** Where each launcher cell leads. Session goes through the exercise selector first. */
export function routeForLauncher(id: LauncherId): Route {
  switch (id) {
    case 'session':
      return { id: 'mode' }
    case 'measure':
    case 'routines':
    case 'summary':
    case 'pain':
    case 'guide':
    case 'settings':
      return { id }
  }
}

/** The first routine for an exercise (the built-in ones come first); null if there is none. */
export function routineForExercise(
  routines: readonly Routine[],
  exercise: Exercise,
): Routine | null {
  return routines.find((routine) => routine.exercise === exercise) ?? null
}
