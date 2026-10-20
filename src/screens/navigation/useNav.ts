import { useContext } from 'react'
import { NavContext } from './NavContext'
import type { Nav } from './NavContext'

export function useNav(): Nav {
  const nav = useContext(NavContext)
  if (!nav) throw new Error('useNav must be used inside a NavProvider')
  return nav
}
