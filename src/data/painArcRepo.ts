import type { StorageClient } from './storage'
import type { PainArc } from './types'
import { parsePainArc } from './validators'

export interface PainArcRepo {
  get(): PainArc | null
  set(arc: PainArc | null): boolean
}

export function createPainArcRepo(storage: StorageClient): PainArcRepo {
  return {
    get: () => storage.read('painArc', parsePainArc),
    set(arc) {
      if (arc === null) {
        storage.remove('painArc')
        return true
      }
      const valid = parsePainArc(arc)
      if (!valid) return false
      storage.write('painArc', valid)
      return true
    },
  }
}
