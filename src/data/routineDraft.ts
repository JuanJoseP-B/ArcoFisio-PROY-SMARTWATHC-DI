import { snapAngle } from '../domain/wheel'
import { translate } from '../i18n/translate'
import { createId } from './ids'
import type { Exercise, Lang, LocalizedName, Routine, Settings } from './types'
import { LIMITS } from './validators'

/** What the Builder edits: the routine's fields, with the name as typed in the current language. */
export interface RoutineDraft {
  name: string
  exercise: Exercise
  target: number
  reps: number
  sets: number
  restSec: number
}

export const EXERCISES: readonly Exercise[] = ['abduction', 'flexion']

/** Lowest target a stepper can reach; targets move in steps of the wheel. */
export const MIN_TARGET_DEG = 5

const clampInt = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)))

/** The name a routine gets when none is typed, in both languages: "Abducción 110°". */
export function autoName(exercise: Exercise, target: number): LocalizedName {
  const name = (lang: Lang) => `${translate(lang, `mode.${exercise}`)} ${target}°`
  return { es: name('es'), en: name('en') }
}

/** A new routine starts from the last target the person chose and sensible counts. */
export function newDraft(settings: Pick<Settings, 'targetDefault'>): RoutineDraft {
  return {
    name: '',
    exercise: 'abduction',
    target: Math.max(MIN_TARGET_DEG, snapAngle(settings.targetDefault)),
    reps: 10,
    sets: 3,
    restSec: 30,
  }
}

export function draftFromRoutine(routine: Routine, lang: Lang): RoutineDraft {
  return {
    name: routine.name[lang],
    exercise: routine.exercise,
    target: routine.targetAngle,
    reps: routine.reps,
    sets: routine.sets,
    restSec: routine.restSec,
  }
}

/** Keeps every field inside what the data layer accepts. */
export function clampDraft(draft: RoutineDraft): RoutineDraft {
  return {
    name: draft.name.slice(0, LIMITS.nameLength),
    exercise: EXERCISES.includes(draft.exercise) ? draft.exercise : 'abduction',
    target: Math.max(MIN_TARGET_DEG, snapAngle(draft.target)),
    reps: clampInt(draft.reps, LIMITS.reps.min, LIMITS.reps.max),
    sets: clampInt(draft.sets, LIMITS.sets.min, LIMITS.sets.max),
    restSec: clampInt(draft.restSec, LIMITS.restSec.min, LIMITS.restSec.max),
  }
}

interface RoutineFromDraft {
  lang: Lang
  tolerance: number
  /** The routine being edited; absent for a new one. */
  previous?: Routine
  id?: string
}

/**
 * The routine to save. A name typed by the person is used in both languages (it is theirs, not
 * a translation); an empty one becomes the automatic name. An edit that leaves the name as it
 * was keeps whatever each language had.
 */
export function routineFromDraft(draft: RoutineDraft, options: RoutineFromDraft): Routine {
  const clean = clampDraft(draft)
  const typed = clean.name.trim()
  const { previous } = options
  const name: LocalizedName =
    previous && typed === previous.name[options.lang]
      ? { ...previous.name }
      : typed === ''
        ? autoName(clean.exercise, clean.target)
        : { es: typed, en: typed }

  return {
    id: previous?.id ?? options.id ?? createId('user'),
    name,
    exercise: clean.exercise,
    targetAngle: clean.target,
    tolerance: options.tolerance,
    reps: clean.reps,
    sets: clean.sets,
    restSec: clean.restSec,
    builtin: false,
  }
}
