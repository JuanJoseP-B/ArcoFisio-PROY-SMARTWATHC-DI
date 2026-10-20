import { useMemo } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { getFeedback } from '../../feedback'
import { BackButton } from '../../ui/BackButton'
import { useNav } from '../navigation/useNav'
import { Session } from './Session'

interface SessionScreenProps {
  routineId: string | undefined
}

/** Session wired to the app: the chosen routine, the saved pain arc, sound, and a way back. */
export function SessionScreen({ routineId }: SessionScreenProps) {
  const { t } = useI18n()
  const nav = useNav()
  const data = getDataLayer()
  const routine = useMemo(
    () => (routineId ? data.routines.get(routineId) : null) ?? data.routines.list()[0] ?? null,
    [data, routineId],
  )

  if (!routine) return null

  return (
    <>
      <Session routine={routine} painArc={data.painArc.get()} feedback={getFeedback()} />
      <BackButton label={t('nav.back')} onBack={nav.back} placement="bottom" />
    </>
  )
}
