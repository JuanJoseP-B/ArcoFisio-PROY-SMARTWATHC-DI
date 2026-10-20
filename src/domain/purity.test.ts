/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const BACKEND_LAYERS = ['domain', 'data', 'sensors', 'feedback', 'i18n']
const FORBIDDEN_IMPORT = /from\s+['"](react|react-dom)(\/[^'"]*)?['"]/

describe('backend layers stay free of React', () => {
  it.each(BACKEND_LAYERS)('src/%s does not import react', (layer) => {
    let files: string[] = []
    try {
      files = readdirSync(join(__dirname, '..', layer)).filter((f) => /\.tsx?$/.test(f))
    } catch {
      return
    }
    for (const file of files) {
      const text = readFileSync(join(__dirname, '..', layer, file), 'utf8')
      expect(FORBIDDEN_IMPORT.test(text), `${layer}/${file}`).toBe(false)
      expect(file.endsWith('.tsx'), `${layer}/${file} must not be a .tsx file`).toBe(false)
    }
  })

  it('scans at least the domain layer', () => {
    expect(readdirSync(__dirname).some((f) => f === 'zones.ts')).toBe(true)
  })
})
