import { useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AMBIENT_WATER, LOADING_END_LEVEL } from './dialGeometry'
import { TideContext } from './tideContext'
import { Water } from './Water'

interface TideProviderProps {
  initial?: number
  children?: ReactNode
}

/**
 * The tide thread (handoff 04): one body of water behind the screens whose level each screen
 * sets, so moving between screens slides the water from the old level to the new one.
 */
export function TideProvider({ initial = LOADING_END_LEVEL, children }: TideProviderProps) {
  const [level, setLevel] = useState(initial)
  const value = useMemo(() => ({ level, setLevel }), [level])
  return <TideContext.Provider value={value}>{children}</TideContext.Provider>
}

/** The water itself; it follows the level the current screen asked for. */
export function TideWater() {
  const tide = useContext(TideContext)
  return <Water level={tide?.level ?? AMBIENT_WATER.prepare} />
}
