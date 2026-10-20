export type ScreenId =
  | 'intro'
  | 'face'
  | 'launcher'
  | 'mode'
  | 'session'
  | 'measure'
  | 'routines'
  | 'summary'
  | 'pain'
  | 'guide'
  | 'settings'

export interface Route {
  readonly id: ScreenId
  /** Routine to run, for the session screen. */
  readonly routineId?: string
}

export interface NavState {
  /** Bottom to top; the last route is the screen on show. */
  readonly stack: readonly Route[]
}

export type NavAction =
  | { type: 'push'; route: Route }
  | { type: 'back' }
  | { type: 'replace'; route: Route }
  | { type: 'reset'; route: Route }

export const initialNav: NavState = { stack: [{ id: 'intro' }] }

export const currentRoute = (state: NavState): Route => state.stack[state.stack.length - 1]!

export const canGoBack = (state: NavState): boolean => state.stack.length > 1

export const sameRoute = (a: Route, b: Route): boolean =>
  a.id === b.id && a.routineId === b.routineId

/** Identity of a screen on show: a new key replays the radial entrance. */
export const routeKey = (route: Route): string =>
  route.routineId ? `${route.id}:${route.routineId}` : route.id

/**
 * The watch has no URL: screens live on a stack. `push` opens a screen over the current one
 * (a repeated tap on the same target is ignored), `back` returns and does nothing at the
 * bottom, `replace` swaps the current screen (the intro hands over to the face this way, so
 * back never returns to it) and `reset` starts over from one screen.
 */
export function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'push':
      return sameRoute(currentRoute(state), action.route)
        ? state
        : { stack: [...state.stack, action.route] }
    case 'back':
      return canGoBack(state) ? { stack: state.stack.slice(0, -1) } : state
    case 'replace':
      return { stack: [...state.stack.slice(0, -1), action.route] }
    case 'reset':
      return { stack: [action.route] }
  }
}
