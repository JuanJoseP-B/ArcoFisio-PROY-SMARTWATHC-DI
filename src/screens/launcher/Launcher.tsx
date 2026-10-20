import { useI18n } from '../../app/useI18n'
import { BeadBands } from '../../ui/BeadBands'
import { HexLauncher } from '../../ui/HexLauncher'
import type { LauncherId } from '../../ui/hexLayout'
import { routeForLauncher } from '../navigation/targets'
import { useNav } from '../navigation/useNav'

/** The seven apps in a honeycomb (sheet 08). Back is a right swipe or Escape. */
export function Launcher() {
  const { t } = useI18n()
  const nav = useNav()

  const names: Record<LauncherId, string> = {
    measure: t('launcher.measure'),
    session: t('launcher.session'),
    routines: t('launcher.routines'),
    summary: t('launcher.summary'),
    pain: t('launcher.pain'),
    guide: t('launcher.guide'),
    settings: t('launcher.settings'),
  }

  return (
    <>
      <BeadBands />
      <HexLauncher
        label={t('launcher.label')}
        names={names}
        onSelect={(id) => nav.push(routeForLauncher(id))}
      />
    </>
  )
}
