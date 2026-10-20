import { useMemo } from 'react'
import { getDataLayer } from '../../data'
import { getFeedback } from '../../feedback'
import { useNav } from '../navigation/useNav'
import { Player } from './Player'

interface PlayerScreenProps {
  routineId: string | undefined
}

/**
 * The player wired to the app: the chosen routine, the saved pain arc, sound, the finished
 * workout kept in the session history, and a way out that lands on the summary, with the
 * launcher under it.
 */
export function PlayerScreen({ routineId }: PlayerScreenProps) {
  const nav = useNav()
  const data = getDataLayer()
  const routine = useMemo(
    () => (routineId ? data.routines.get(routineId) : null) ?? data.routines.list()[0] ?? null,
    [data, routineId],
  )

  if (!routine) return null

  return (
    <Player
      routine={routine}
      painArc={data.painArc.get()}
      feedback={getFeedback()}
      onMeasure={() => nav.push({ id: 'measure' })}
      onFinish={(session) => {
        if (session) data.sessions.add(session)
      }}
      onExit={() => {
        nav.reset({ id: 'face' })
        nav.push({ id: 'launcher' })
        nav.push({ id: 'summary' })
      }}
    />
  )
}
