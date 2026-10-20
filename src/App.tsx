import { SensorProbe } from './app/SensorProbe'
import { WatchStage } from './app/WatchStage'
import { getDataLayer } from './data'
import { I18nProvider } from './app/I18nProvider'
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
      <Intro />
    </RadialTransition>
  )
}

export function App() {
  return (
    <I18nProvider lang={getDataLayer().settings.get().lang}>
      <WatchStage>
        <WatchBezel>
          <WatchScreen>
            <CurrentScreen />
          </WatchScreen>
        </WatchBezel>
      </WatchStage>
    </I18nProvider>
  )
}
