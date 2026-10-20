/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { es } from './es'

const SRC = join(__dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : []
  })
}

const keys = Object.keys(es) as (keyof typeof es)[]

/** Messages that read the same in both languages: numbers and symbols, and each language's own name. */
const SAME_IN_BOTH = new Set<string>([
  'config.seconds',
  'routine.summary',
  'settings.toleranceValue',
  'lang.es',
  'lang.en',
])

describe('every message is translated', () => {
  it('does not leave an English message equal to the Spanish one', () => {
    const same = keys.filter((key) => en[key] === es[key] && !SAME_IN_BOTH.has(key))
    expect(same).toEqual([])
  })
})

/** Text a person reads must come from the dictionaries, never be typed into a component. */
describe('no visible text is written into a component', () => {
  // The brand mark of the intro is a logo, not a sentence.
  const BRAND = new Set(['screens/intro/Wordmark.tsx'])
  const files = sourceFiles(SRC).filter(
    (path) => !BRAND.has(relative(SRC, path).split('\\').join('/')),
  )

  const TEXT_BETWEEN_TAGS = />\s*([^<>{}\n]*[A-Za-zÁ-ÿ]{2,}[^<>{}\n]*)\s*<\//g
  const TEXT_ATTRIBUTE =
    /\b(?:aria-label|title|placeholder|alt|label)="([^"]*[A-Za-zÁ-ÿ]{2,}[^"]*)"/g

  it('catches text typed into a component', () => {
    const sample = '<span aria-label="Cerrar">Hola mundo</span>'
    expect([...sample.matchAll(TEXT_BETWEEN_TAGS)]).toHaveLength(1)
    expect([...sample.matchAll(TEXT_ATTRIBUTE)]).toHaveLength(1)
  })

  it('has components to scan', () => {
    expect(files.length).toBeGreaterThan(30)
  })

  it.each(files.map((path) => [relative(SRC, path).split('\\').join('/'), path]))(
    '%s',
    (_name, path) => {
      const code = readFileSync(path as string, 'utf8')
      const found = [
        ...[...code.matchAll(TEXT_BETWEEN_TAGS)].map((m) => m[1]),
        ...[...code.matchAll(TEXT_ATTRIBUTE)].map((m) => m[1]),
      ]
      expect(found).toEqual([])
    },
  )
})
