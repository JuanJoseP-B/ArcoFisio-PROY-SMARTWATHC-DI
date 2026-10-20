import type { StorageBackend } from './storage'

export class FakeStorage implements StorageBackend {
  failReads = false
  failWrites = false
  private readonly map = new Map<string, string>()

  get length(): number {
    return this.map.size
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null
  }

  getItem(key: string): string | null {
    if (this.failReads) throw new Error('storage blocked')
    return this.map.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error('quota exceeded')
    this.map.set(key, value)
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  seed(key: string, value: string): void {
    this.map.set(key, value)
  }

  has(key: string): boolean {
    return this.map.has(key)
  }
}
