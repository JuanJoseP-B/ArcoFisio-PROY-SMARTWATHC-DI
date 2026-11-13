import { NavHost } from '../screens/navigation/NavHost'
import { themeForRoute } from '../screens/navigation/theme'
import { useNav } from '../screens/navigation/useNav'
import { WatchBezel } from '../ui/WatchBezel'
import { WatchScreen } from '../ui/WatchScreen'
import { WatchStage } from './WatchStage'

/**
 * The watch: stage, bezel, screen and the screen stack. It reads the screen on show to dress
 * the surroundings in the matching theme (Marea for screens 00-07, the v1 look for the rest).
 * Must sit inside a NavProvider.
 */
export function Shell() {
  const theme = themeForRoute(useNav().route)
  return (
    <WatchStage theme={theme}>
      <WatchBezel theme={theme}>
        <WatchScreen theme={theme}>
          <NavHost />
        </WatchScreen>
      </WatchBezel>
    </WatchStage>
  )
}
