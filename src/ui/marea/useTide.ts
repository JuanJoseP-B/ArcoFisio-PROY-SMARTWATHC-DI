import { useContext, useEffect } from 'react'
import { TideContext } from './tideContext'

/** A screen calls this with the water level it wants while it is on show. */
export function useTide(level: number): void {
  const setLevel = useContext(TideContext)?.setLevel
  useEffect(() => {
    setLevel?.(level)
  }, [setLevel, level])
}
