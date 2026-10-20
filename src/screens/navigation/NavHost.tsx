import { useRef } from 'react'
import { useSwipeBack } from '../../app/useSwipeBack'
import { RadialTransition } from '../../ui/RadialTransition'
import styles from './NavHost.module.css'
import { ScreenSwitch } from './ScreenSwitch'
import { routeKey } from './stack'
import { useNav } from './useNav'

/**
 * Shows the screen on top of the stack inside the radial entrance, and turns a right swipe
 * anywhere on it into "back". Must sit inside a NavProvider.
 */
export function NavHost() {
  const nav = useNav()
  const surface = useRef<HTMLDivElement>(null)
  useSwipeBack(surface, nav.back, nav.canGoBack)

  return (
    <div ref={surface} className={styles.host} data-part="nav-host">
      <RadialTransition screenKey={routeKey(nav.route)}>
        <ScreenSwitch route={nav.route} />
      </RadialTransition>
    </div>
  )
}
