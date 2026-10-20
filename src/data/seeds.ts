import type { Routine } from './types'

export const SEED_ROUTINES: readonly Routine[] = [
  {
    id: 'builtin-abduction-90',
    name: { es: 'Abducción 90°', en: 'Abduction 90°' },
    exercise: 'abduction',
    targetAngle: 90,
    tolerance: 2,
    reps: 10,
    sets: 3,
    restSec: 30,
    builtin: true,
  },
  {
    id: 'builtin-abduction-120',
    name: { es: 'Abducción 120°', en: 'Abduction 120°' },
    exercise: 'abduction',
    targetAngle: 120,
    tolerance: 2,
    reps: 8,
    sets: 3,
    restSec: 45,
    builtin: true,
  },
  {
    id: 'builtin-flexion-150',
    name: { es: 'Flexión 150°', en: 'Flexion 150°' },
    exercise: 'flexion',
    targetAngle: 150,
    tolerance: 2,
    reps: 8,
    sets: 3,
    restSec: 45,
    builtin: true,
  },
  {
    id: 'builtin-assisted-60',
    name: { es: 'Elevación asistida 60°', en: 'Assisted elevation 60°' },
    exercise: 'flexion',
    targetAngle: 60,
    tolerance: 2,
    reps: 12,
    sets: 2,
    restSec: 30,
    builtin: true,
  },
]

export const SEED_IDS: ReadonlySet<string> = new Set(SEED_ROUTINES.map((routine) => routine.id))
