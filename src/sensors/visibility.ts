import type { AngleTracker } from './tracker'

export interface VisibilityDocument {
  readonly visibilityState: string
  addEventListener(type: 'visibilitychange', listener: () => void): void
  removeEventListener(type: 'visibilitychange', listener: () => void): void
}

/** Pauses the sensor while the tab is hidden and resumes it when it returns. */
export function bindVisibility(
  tracker: Pick<AngleTracker, 'pause' | 'resume'>,
  doc: VisibilityDocument = document,
): () => void {
  const onChange = (): void => {
    if (doc.visibilityState === 'hidden') tracker.pause()
    else tracker.resume()
  }
  doc.addEventListener('visibilitychange', onChange)
  return () => doc.removeEventListener('visibilitychange', onChange)
}
