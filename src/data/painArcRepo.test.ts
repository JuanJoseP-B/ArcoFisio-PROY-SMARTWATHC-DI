import { describe, expect, it } from 'vitest'
import { createPainArcRepo } from './painArcRepo'
import { createStorage } from './storage'
import { FakeStorage } from './testStorage'

describe('pain arc repository', () => {
  it('has no arc by default', () => {
    expect(createPainArcRepo(createStorage(new FakeStorage())).get()).toBeNull()
  })

  it('stores and reloads an arc', () => {
    const backend = new FakeStorage()
    expect(createPainArcRepo(createStorage(backend)).set({ from: 70, to: 110 })).toBe(true)
    expect(createPainArcRepo(createStorage(backend)).get()).toEqual({ from: 70, to: 110 })
  })

  it('removes the arc when set to null', () => {
    const backend = new FakeStorage()
    const repo = createPainArcRepo(createStorage(backend))
    repo.set({ from: 70, to: 110 })
    expect(repo.set(null)).toBe(true)
    expect(repo.get()).toBeNull()
    expect(backend.has('arcofisio:v1:painArc')).toBe(false)
  })

  it('rejects an inverted or out-of-range arc', () => {
    const repo = createPainArcRepo(createStorage(new FakeStorage()))
    expect(repo.set({ from: 110, to: 70 })).toBe(false)
    expect(repo.set({ from: 0, to: 200 })).toBe(false)
    expect(repo.get()).toBeNull()
  })
})
