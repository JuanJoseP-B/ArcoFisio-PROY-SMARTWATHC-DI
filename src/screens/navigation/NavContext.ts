import { createContext } from 'react'
import type { Route, ScreenId } from './stack'

export interface Nav {
  /** The screen on show. */
  readonly route: Route
  readonly canGoBack: boolean
  push(route: Route): void
  back(): void
  replace(route: Route): void
  /** Drops the whole stack and starts over from one screen. */
  reset(route: Route): void
  /** Goes back to the nearest screen below with this id, dropping what is above it. */
  popTo(id: ScreenId): void
}

export const NavContext = createContext<Nav | null>(null)
