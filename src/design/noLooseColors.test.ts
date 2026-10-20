/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')
const SCANNED = /\.(tsx?|css)$/
const SKIPPED = /\.test\.tsx?$/
const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/

function collect(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (path !== join(SRC, 'design')) collect(path, found)
    } else if (SCANNED.test(entry) && !SKIPPED.test(entry)) {
      found.push(path)
    }
  }
  return found
}

describe('design tokens are the only source of color', () => {
  const files = collect(SRC)

  it('scans the application sources', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('has no hex, rgb or hsl literals outside src/design', () => {
    const offenders: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (COLOR_LITERAL.test(line)) offenders.push(`${file}:${i + 1}`)
        })
    }
    expect(offenders).toEqual([])
  })
})
