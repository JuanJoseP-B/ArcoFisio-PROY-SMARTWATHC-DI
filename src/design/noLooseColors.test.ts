import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')
const SCANNED_EXTENSIONS = /\.(tsx?|css)$/
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

const isAllowed = (path: string) => {
  const rel = relative(SRC, path).split(sep)
  return rel[0] === 'design' || /\.test\.tsx?$/.test(path)
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (SCANNED_EXTENSIONS.test(path)) yield path
  }
}

describe('design tokens are the only source of color', () => {
  it('has no hex, rgb or hsl literals outside src/design', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      if (isAllowed(file)) continue
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (COLOR_LITERAL.test(line)) offenders.push(`${relative(SRC, file)}:${i + 1}`)
      })
    }
    expect(offenders).toEqual([])
  })
})
