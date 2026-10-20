import { describe, expect, it } from 'vitest'
import { MIGRATIONS, migrate } from './migrations'

describe('migrate', () => {
  it('returns the data untouched when the versions are equal', () => {
    const data = { a: 1 }
    expect(migrate(1, 1, data)).toEqual({ ok: true, data })
  })

  it('has no registered steps while only schema 1 exists', () => {
    expect(Object.keys(MIGRATIONS)).toHaveLength(0)
    expect(migrate(1, 2, {})).toEqual({ ok: false })
  })

  it('chains the steps in order', () => {
    const steps = {
      1: (d: unknown) => ({ ...(d as object), v2: true }),
      2: (d: unknown) => ({ ...(d as object), v3: true }),
    }
    expect(migrate(1, 3, { base: 1 }, steps)).toEqual({
      ok: true,
      data: { base: 1, v2: true, v3: true },
    })
  })

  it('refuses downgrades, invalid versions and missing steps', () => {
    expect(migrate(2, 1, {})).toEqual({ ok: false })
    expect(migrate(1.5, 2, {})).toEqual({ ok: false })
    expect(migrate(1, 3, {}, { 1: (d) => d })).toEqual({ ok: false })
  })

  it('reports a failing step instead of throwing', () => {
    const steps = {
      1: () => {
        throw new Error('boom')
      },
    }
    expect(migrate(1, 2, {}, steps)).toEqual({ ok: false })
  })
})
