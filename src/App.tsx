import { useEffect } from 'react'
import { I18nProvider } from './app/I18nProvider'
import { SimulatorPanel } from './app/SimulatorPanel'
import { WatchStage } from './app/WatchStage'
import { getDataLayer } from './data'
import { getFeedback } from './feedback'
import { installAudioUnlock } from './feedback/audioUnlock'
import { NavHost } from './screens/navigation/NavHost'
import { NavProvider } from './screens/navigation/NavProvider'
import { isSimRequested } from './sensors/kit'
import { WatchBezel } from './ui/WatchBezel'
import { WatchScreen } from './ui/WatchScreen'

export function App() {
  // Audio stays silent until the first touch; this unlocks it on that gesture.
  useEffect(() => installAudioUnlock(getFeedback().audio), [])

  return (
    <I18nProvider
      lang={getDataLayer().settings.get().lang}
      onLangChange={(lang) => getDataLayer().settings.update({ lang })}
    >
      <NavProvider>
        <WatchStage>
          <WatchBezel>
            <WatchScreen>
              <NavHost />
            </WatchScreen>
          </WatchBezel>
        </WatchStage>
      </NavProvider>
      {isSimRequested(window.location.search) ? <SimulatorPanel /> : null}
    </I18nProvider>
  )
}
