import { useEffect } from 'react'
import { I18nProvider } from './app/I18nProvider'
import { SimulatorPanel } from './app/SimulatorPanel'
import { WatchStage } from './app/WatchStage'
import { getDataLayer } from './data'
import type { Routine } from './data'
import { installAudioUnlock } from './feedback/audioUnlock'
import { getFeedback } from './feedback'
import { isSimRequested } from './sensors/kit'
import { Intro } from './screens/intro/Intro'
import { Session } from './screens/session/Session'
import { RadialTransition } from './ui/RadialTransition'
import { WatchScreen } from './ui/WatchScreen'
import { WatchBezel } from './ui/WatchBezel'

const params = (): URLSearchParams => new URLSearchParams(window.location.search)

/** The routine for ?session=1: the one named by ?routine=<id>, else the first available. */
function pickRoutine(routines: Routine[], id: string | null): Routine | null {
  return routines.find((routine) => routine.id === id) ?? routines[0] ?? null
}

/** Interim screen host: the stage 8 navigation machine replaces this choice. */
function CurrentScreen() {
  const query = params()
  const data = getDataLayer()
  const routine =
    query.get('session') === '1' ? pickRoutine(data.routines.list(), query.get('routine')) : null

  if (routine) {
    return (
      <RadialTransition screenKey="session">
        <Session routine={routine} painArc={data.painArc.get()} feedback={getFeedback()} />
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
  // Audio stays silent until the first touch; this unlocks it on that gesture.
  useEffect(() => installAudioUnlock(getFeedback().audio), [])

  return (
    <I18nProvider lang={getDataLayer().settings.get().lang}>
      <WatchStage>
        <WatchBezel>
          <WatchScreen>
            <CurrentScreen />
          </WatchScreen>
        </WatchBezel>
      </WatchStage>
      {isSimRequested(window.location.search) ? <SimulatorPanel /> : null}
    </I18nProvider>
  )
}
