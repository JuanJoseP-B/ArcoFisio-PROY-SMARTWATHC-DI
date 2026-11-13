import { useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { NavContext } from './NavContext'
import type { Nav } from './NavContext'
import { canGoBack, currentRoute, initialNav, navReducer } from './stack'
import type { NavState } from './stack'

interface NavProviderProps {
  /** Stack to start from; the watch starts on the intro. */
  initial?: NavState
  children?: ReactNode
}

/** Keys that go back; Backspace is left alone while the person types in a field. */
const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) &&
  !(target instanceof HTMLInputElement && ['range', 'checkbox', 'radio'].includes(target.type))

/**
 * Holds the screen stack and gives screens `push`, `back`, `replace`, `reset` and `popTo`.
 * Escape and Backspace go back.
 */
export function NavProvider({ initial = initialNav, children }: NavProviderProps) {
  const [state, dispatch] = useReducer(navReducer, initial)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || (event.key === 'Backspace' && !isTyping(event.target))) {
        dispatch({ type: 'back' })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo<Nav>(
    () => ({
      route: currentRoute(state),
      canGoBack: canGoBack(state),
      push: (route) => dispatch({ type: 'push', route }),
      back: () => dispatch({ type: 'back' }),
      replace: (route) => dispatch({ type: 'replace', route }),
      reset: (route) => dispatch({ type: 'reset', route }),
      popTo: (id) => dispatch({ type: 'popTo', id }),
    }),
    [state],
  )

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}
