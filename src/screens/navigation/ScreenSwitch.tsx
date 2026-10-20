import { getDataLayer } from '../../data'
import { Config } from '../config/Config'
import { Counts } from '../config/Counts'
import { Face } from '../face/Face'
import { Intro } from '../intro/Intro'
import { Library } from '../library/Library'
import { Launcher } from '../launcher/Launcher'
import { Measure } from '../measure/Measure'
import { ModeSelect } from '../mode/ModeSelect'
import { PlayerScreen } from '../player/PlayerScreen'
import { Placeholder } from '../placeholder/Placeholder'
import { LanguageSelect } from '../setup/LanguageSelect'
import { SensorSetup } from '../setup/SensorSetup'
import type { Route } from './stack'
import { useNav } from './useNav'

/** The very first time, the intro leads into choosing a language and setting up the sensor. */
const firstRunDone = (): boolean => getDataLayer().settings.get().firstRunDone

interface ScreenSwitchProps {
  route: Route
}

/**
 * Which screen each route shows. The apps a later stage builds (Routines, Summary, Pain, AI
 * Guide, Settings) show a placeholder until then.
 */
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
    case 'builder':
      return <Placeholder title="launcher.routines" />
    case 'summary':
      return <Placeholder title="launcher.summary" />
    case 'pain':
      return <Placeholder title="launcher.pain" />
    case 'guide':
      return <Placeholder title="launcher.guide" />
    case 'settings':
      return <Placeholder title="launcher.settings" />
  }
}
