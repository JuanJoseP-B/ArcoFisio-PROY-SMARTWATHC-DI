import { useRef } from 'react'
import { useSwipeBack } from '../../app/useSwipeBack'
import { ContentIn } from '../../ui/marea/ContentIn'
import { TideProvider, TideWater } from '../../ui/marea/Tide'
import { RadialTransition } from '../../ui/RadialTransition'
import styles from './NavHost.module.css'
import { ScreenSwitch } from './ScreenSwitch'
import { routeKey } from './stack'
import { themeForRoute } from './theme'
import { useNav } from './useNav'

/**
 * Shows the screen on top of the stack and turns a right swipe anywhere on it into "back".
 * Marea screens sit on one body of water that slides to each screen's level and bring their
 * content in with a short fade; the screens of the later phases keep the v1 radial entrance.
 * The loading animation draws its own water, so the shared one waits for the next screen.
 * Must sit inside a NavProvider.
 */
export function NavHost() {
  const nav = useNav()
  const surface = useRef<HTMLDivElement>(null)
  useSwipeBack(surface, nav.back, nav.canGoBack)

  const theme = themeForRoute(nav.route)
  const screen = <ScreenSwitch route={nav.route} />

  return (
    <div ref={surface} className={styles.host} data-part="nav-host" data-theme={theme}>
      <TideProvider>
        {theme === 'marea' ? (
          <>
            {nav.route.id === 'intro' ? null : <TideWater />}
            <ContentIn screenKey={routeKey(nav.route)}>{screen}</ContentIn>
          </>
        ) : (
          <RadialTransition screenKey={routeKey(nav.route)}>{screen}</RadialTransition>
        )}
      </TideProvider>
    </div>
  )
}
