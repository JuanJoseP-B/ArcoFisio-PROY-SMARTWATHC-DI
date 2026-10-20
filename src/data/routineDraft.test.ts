import { describe, expect, it } from 'vitest'
import { autoName, clampDraft, draftFromRoutine, newDraft, routineFromDraft } from './routineDraft'
import type { RoutineDraft } from './routineDraft'
import { createRoutinesRepo } from './routinesRepo'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'
import type { Routine } from './types'

const draft: RoutineDraft = {
  name: '',
  exercise: 'flexion',
  target: 135,
  reps: 6,
  sets: 4,
  restSec: 20,
}

const existing: Routine = {
  id: 'user-1',
  name: { es: 'Mi rutina', en: 'My routine' },
  exercise: 'flexion',
  targetAngle: 135,
  tolerance: 2,
  reps: 6,
  sets: 4,
  restSec: 20,
  builtin: false,
}

describe('routineDraft', () => {
  it('names a routine after its exercise and target in both languages', () => {
    expect(autoName('abduction', 110)).toEqual({ es: 'Abducción 110°', en: 'Abduction 110°' })
    expect(autoName('flexion', 60)).toEqual({ es: 'Flexión 60°', en: 'Flexion 60°' })
  })

  it('starts a new draft from the last target, snapped to the wheel step', () => {
    expect(newDraft({ targetDefault: 112 })).toMatchObject({
      name: '',
      exercise: 'abduction',
      target: 110,
      reps: 10,
      sets: 3,
      restSec: 30,
    })
  })

  it('never starts a draft with a target of 0', () => {
    expect(newDraft({ targetDefault: 0 }).target).toBe(5)
  })

  it('reads a routine into a draft with its name in the current language', () => {
    expect(draftFromRoutine(existing, 'en')).toEqual({
      name: 'My routine',
      exercise: 'flexion',
      target: 135,
      reps: 6,
      sets: 4,
      restSec: 20,
    })
  })

  it('keeps every field inside what the data layer accepts', () => {
    const wild: RoutineDraft = {
      name: 'x'.repeat(90),
      exercise: 'flexion',
      target: 400,
      reps: 0,
      sets: 99,
      restSec: -5,
    }
    expect(clampDraft(wild)).toEqual({
      name: 'x'.repeat(60),
      exercise: 'flexion',
      target: 180,
      reps: 1,
      sets: 20,
      restSec: 0,
    })
  })

  it('makes a new routine of the person with an id of its own', () => {
    const a = routineFromDraft(draft, { lang: 'es', tolerance: 3 })
    const b = routineFromDraft(draft, { lang: 'es', tolerance: 3 })
    expect(a).toMatchObject({
      name: { es: 'Flexión 135°', en: 'Flexion 135°' },
      exercise: 'flexion',
      targetAngle: 135,
      tolerance: 3,
      reps: 6,
      sets: 4,
      restSec: 20,
      builtin: false,
    })
    expect(a.id).toMatch(/^user-/)
    expect(a.id).not.toBe(b.id)
  })

  it('uses a typed name, trimmed, in both languages', () => {
    const routine = routineFromDraft(
      { ...draft, name: '  Después del yeso  ' },
      { lang: 'es', tolerance: 2 },
    )
    expect(routine.name).toEqual({ es: 'Después del yeso', en: 'Después del yeso' })
  })

  it('treats a name of only spaces as no name', () => {
    const routine = routineFromDraft({ ...draft, name: '   ' }, { lang: 'en', tolerance: 2 })
    expect(routine.name).toEqual(autoName('flexion', 135))
  })

  it('keeps the id and both names when an edit leaves the name alone', () => {
    const edited = routineFromDraft(
      { ...draftFromRoutine(existing, 'es'), reps: 8 },
      { lang: 'es', tolerance: 2, previous: existing },
    )
    expect(edited).toMatchObject({
      id: 'user-1',
      name: { es: 'Mi rutina', en: 'My routine' },
      reps: 8,
    })
  })

  it('renames in both languages when the edit changes the name', () => {
    const edited = routineFromDraft(
      { ...draftFromRoutine(existing, 'en'), name: 'Warm-up' },
      { lang: 'en', tolerance: 2, previous: existing },
    )
    expect(edited.name).toEqual({ es: 'Warm-up', en: 'Warm-up' })
  })

  it('goes back to the automatic name when the typed one is cleared in an edit', () => {
    const edited = routineFromDraft(
      { ...draftFromRoutine(existing, 'es'), name: '' },
      { lang: 'es', tolerance: 2, previous: existing },
    )
    expect(edited.name).toEqual(autoName('flexion', 135))
  })

  it('produces routines the repository accepts and lists', () => {
    const repo = createRoutinesRepo(createStorage(new FakeStorage()))
    const routine = routineFromDraft({ ...draft, name: 'Mía' }, { lang: 'es', tolerance: 2 })
    expect(repo.save(routine)).toBe(true)
    expect(repo.get(routine.id)).toEqual(routine)
  })
})
