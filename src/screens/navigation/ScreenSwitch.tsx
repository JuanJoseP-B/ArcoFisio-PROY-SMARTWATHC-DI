import { getDataLayer } from '../../data'
import { Builder } from '../builder/Builder'
import { Config } from '../config/Config'
import { Counts } from '../config/Counts'
import { Face } from '../face/Face'
import { Guide } from '../guide/Guide'
import { History } from '../history/History'
import { Intro } from '../intro/Intro'
import { Library } from '../library/Library'
import { Launcher } from '../launcher/Launcher'
import { Measure } from '../measure/Measure'
import { ModeSelect } from '../mode/ModeSelect'
import { Pain } from '../pain/Pain'
import { PlayerScreen } from '../player/PlayerScreen'
import { RoutineDetail } from '../routine/RoutineDetail'
import { Settings } from '../settings/Settings'
import { Summary } from '../summary/Summary'
import { LanguageSelect } from '../setup/LanguageSelect'
import { SensorSetup } from '../setup/SensorSetup'
import type { Route } from './stack'
import { useNav } from './useNav'

/** The very first time, the intro leads into choosing a language and setting up the sensor. */
const firstRunDone = (): boolean => getDataLayer().settings.get().firstRunDone

interface ScreenSwitchProps {
  route: Route
}

/** Which screen each route shows. */
export function ScreenSwitch({ route }: ScreenSwitchProps) {
  const nav = useNav()

  switch (route.id) {
    case 'intro':
      return <Intro onDone={() => nav.replace({ id: firstRunDone() ? 'face' : 'language' })} />
    case 'language':
      return <LanguageSelect />
    case 'setup':
      return <SensorSetup />
    case 'face':
      return <Face />
    case 'launcher':
      return <Launcher />
    case 'mode':
      return <ModeSelect />
    case 'config':
      return <Config exercise={route.exercise ?? 'abduction'} />
    case 'counts':
      return <Counts exercise={route.exercise ?? 'abduction'} />
    case 'session':
      return <PlayerScreen routineId={route.routineId} />
    case 'measure':
      return <Measure />
    case 'routines':
      return <Library />
    case 'routine':
      return <RoutineDetail routineId={route.routineId} />
    case 'builder':
      return <Builder routineId={route.routineId} />
    case 'summary':
      return <Summary />
    case 'history':
      return <History />
    case 'pain':
      return <Pain />
    case 'guide':
      return <Guide />
    case 'settings':
      return <Settings />
  }
}
