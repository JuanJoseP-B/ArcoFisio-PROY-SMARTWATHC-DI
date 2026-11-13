import { createContext } from 'react'

export interface TideValue {
  level: number
  setLevel(level: number): void
}

export const TideContext = createContext<TideValue | null>(null)
