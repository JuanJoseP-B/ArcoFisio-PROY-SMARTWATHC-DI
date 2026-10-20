import { snapAngle } from '../domain/wheel'
import { SEED_ROUTINES } from './seeds'
import type { RoutinesRepo } from './routinesRepo'
import type { SettingsRepo } from './settingsRepo'
import type { Exercise, LocalizedName, Routine } from './types'
import { LIMITS } from './validators'

/** What the Configuration screen edits before a session. */
export interface RoutineConfig {
  target: number
  reps: number
  sets: number
  restSec: number
}

const NAMES: Record<Exercise, LocalizedName> = {
  abduction: { es: 'Abducción personalizada', en: 'Custom abduction' },
  flexion: { es: 'Flexión personalizada', en: 'Custom flexion' },
}

/** One custom routine per exercise holds what the person last configured. */
export const quickRoutineId = (exercise: Exercise): string => `user-quick-${exercise}`

const clampInt = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)))

export function clampConfig(config: RoutineConfig): RoutineConfig {
  return {
    target: snapAngle(config.target),
    reps: clampInt(config.reps, LIMITS.reps.min, LIMITS.reps.max),
    sets: clampInt(config.sets, LIMITS.sets.min, LIMITS.sets.max),
    restSec: clampInt(config.restSec, LIMITS.restSec.min, LIMITS.restSec.max),
  }
}

/**
 * Starting point for an exercise: the last saved configuration, or the target the person
 * chose last time with the first built-in routine's counts.
 */
export function loadConfig(
  repos: { settings: SettingsRepo; routines: RoutinesRepo },
  exercise: Exercise,
): RoutineConfig {
  const saved = repos.routines.get(quickRoutineId(exercise))
  const seed = SEED_ROUTINES.find((routine) => routine.exercise === exercise) ?? SEED_ROUTINES[0]!
  const base = saved ?? seed
  return clampConfig({
    target: saved ? saved.targetAngle : repos.settings.get().targetDefault,
    reps: base.reps,
    sets: base.sets,
    restSec: base.restSec,
  })
}

/** Saves the configuration as the exercise's custom routine and remembers the target. */
export function saveConfig(
  repos: { settings: SettingsRepo; routines: RoutinesRepo },
  exercise: Exercise,
  config: RoutineConfig,
): Routine | null {
  const clean = clampConfig(config)
  const routine: Routine = {
    id: quickRoutineId(exercise),
    name: { ...NAMES[exercise] },
    exercise,
    targetAngle: clean.target,
    tolerance: repos.settings.get().tolerance,
    reps: clean.reps,
    sets: clean.sets,
    restSec: clean.restSec,
    builtin: false,
  }
  if (!repos.routines.save(routine)) return null
  repos.settings.update({ targetDefault: clean.target })
  return routine
}
