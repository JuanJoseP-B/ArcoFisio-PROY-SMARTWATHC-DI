import { Config } from '../config/Config'
import { Counts } from '../config/Counts'
import { Face } from '../face/Face'
import { Intro } from '../intro/Intro'
import { Launcher } from '../launcher/Launcher'
import { ModeSelect } from '../mode/ModeSelect'
import { Placeholder } from '../placeholder/Placeholder'
import { SessionScreen } from '../session/SessionScreen'
import type { Route } from './stack'
import { useNav } from './useNav'

interface ScreenSwitchProps {
  route: Route
}

/**
 * Which screen each route shows. The apps a later stage builds (Measure, Routines, Summary,
 * Pain, AI Guide, Settings) show a placeholder until then.
 */
export function ScreenSwitch({ route }: ScreenSwitchProps) {
  const nav = useNav()

  switch (route.id) {
    case 'intro':
      return <Intro onDone={() => nav.replace({ id: 'face' })} />
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
      return <SessionScreen routineId={route.routineId} />
    case 'measure':
      return <Placeholder title="launcher.measure" />
    case 'routines':
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
