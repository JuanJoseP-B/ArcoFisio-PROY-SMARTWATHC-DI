import { useEffect, useState } from 'react'

export interface ViewportSize {
  width: number
  height: number
}

const read = (): ViewportSize => {
  const vv = window.visualViewport
  return { width: vv?.width ?? window.innerWidth, height: vv?.height ?? window.innerHeight }
}

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(read)

  useEffect(() => {
    const update = () => setSize(read())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.visualViewport?.addEventListener('resize', update)
    update()
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  return size
}
