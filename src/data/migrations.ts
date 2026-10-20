export type MigrationStep = (data: unknown) => unknown

export type MigrationResult = { ok: true; data: unknown } | { ok: false }

// MIGRATIONS[n] upgrades data stored with schema n to schema n + 1.
export const MIGRATIONS: Readonly<Record<number, MigrationStep>> = {}

export function migrate(
  from: number,
  to: number,
  data: unknown,
  steps: Readonly<Record<number, MigrationStep>> = MIGRATIONS,
): MigrationResult {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) return { ok: false }

  let current = data
  for (let version = from; version < to; version++) {
    const step = steps[version]
    if (!step) return { ok: false }
    try {
      current = step(current)
    } catch {
      return { ok: false }
    }
  }
  return { ok: true, data: current }
}
