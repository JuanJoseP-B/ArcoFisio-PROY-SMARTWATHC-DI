/// <reference types="node" />
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

function files(dir: string, pattern: RegExp): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path, pattern)
    return pattern.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

const name = (path: string) => relative(SRC, path).split('\\').join('/')

describe('motion rules', () => {
  const styles = files(SRC, /\.css$/)
  const code = files(SRC, /\.tsx?$/)

  it('has files to scan', () => {
    expect(styles.length).toBeGreaterThan(20)
    expect(code.length).toBeGreaterThan(100)
  })

  // The intro runs its single fade only in the reduced-motion mode; its script decides the mode.
  const DECIDES_IN_SCRIPT = new Set(['screens/intro/Intro.module.css'])

  it('lets every stylesheet that moves things switch the movement off', () => {
    const missing = styles
      .filter((path) => /\b(animation|transition)\b/.test(readFileSync(path, 'utf8')))
      .filter((path) => !DECIDES_IN_SCRIPT.has(name(path)))
      .filter((path) => !readFileSync(path, 'utf8').includes('prefers-reduced-motion'))
    expect(missing.map(name)).toEqual([])
  })

  it('never uses setInterval: animation runs on keyframes or requestAnimationFrame', () => {
    const using = code.filter((path) => /\bsetInterval\s*\(/.test(readFileSync(path, 'utf8')))
    expect(using.map(name)).toEqual([])
  })

  it('clears every timer it sets', () => {
    const leaky = code
      .filter((path) => /\bsetTimeout\s*\(/.test(readFileSync(path, 'utf8')))
      .filter((path) => !/\bclearTimeout\s*\(/.test(readFileSync(path, 'utf8')))
    expect(leaky.map(name)).toEqual([])
  })

  it('cancels every animation frame it requests', () => {
    const leaky = code
      .filter((path) => /\brequestAnimationFrame\s*\(/.test(readFileSync(path, 'utf8')))
      .filter((path) => !/\bcancelAnimationFrame\s*\(/.test(readFileSync(path, 'utf8')))
    expect(leaky.map(name)).toEqual([])
  })
})
