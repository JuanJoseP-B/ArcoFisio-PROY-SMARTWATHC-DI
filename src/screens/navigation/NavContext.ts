import { createContext } from 'react'
import type { Route } from './stack'

export interface Nav {
  /** The screen on show. */
  readonly route: Route
  readonly canGoBack: boolean
  push(route: Route): void
  back(): void
  replace(route: Route): void
}

export const NavContext = createContext<Nav | null>(null)
