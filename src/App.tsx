import { SensorProbe } from './app/SensorProbe'
import { WatchStage } from './app/WatchStage'
import { getDataLayer } from './data'
import { Intro } from './screens/intro/Intro'
import { RadialTransition } from './ui/RadialTransition'
import { SafeZone, WatchScreen } from './ui/WatchScreen'
import { WatchBezel } from './ui/WatchBezel'

const probeRequested = (): boolean =>
  new URLSearchParams(window.location.search).get('probe') === '1'

/** Interim screen host: the stage 8 navigation machine replaces this choice. */
function CurrentScreen() {
  if (probeRequested()) {
    return (
      <RadialTransition screenKey="probe">
        <SafeZone>
          <SensorProbe />
        </SafeZone>
      </RadialTransition>
    )
  }

  return (
    <RadialTransition screenKey="intro">
      <Intro lang={getDataLayer().settings.get().lang} />
    </RadialTransition>
  )
}

export function App() {
  return (
    <WatchStage>
      <WatchBezel>
        <WatchScreen>
          <CurrentScreen />
        </WatchScreen>
      </WatchBezel>
    </WatchStage>
  )
}
