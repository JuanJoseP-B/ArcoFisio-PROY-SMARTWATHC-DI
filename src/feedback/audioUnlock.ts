import type { AudioEngine } from './audioEngine'

const GESTURES = ['pointerdown', 'touchend', 'keydown'] as const

/**
 * Browsers keep audio silent until the person touches the page. This unlocks the engine on
 * the first gesture, and keeps listening if the browser still refuses until one works.
 * Returns a function that removes the listeners.
 */
export function installAudioUnlock(
  engine: AudioEngine,
  target: EventTarget = document,
): () => void {
  let pending = false

  const remove = (): void => {
    for (const type of GESTURES) target.removeEventListener(type, onGesture)
  }

  function onGesture(): void {
    if (pending) return
    pending = true
    void engine.unlock().then((unlocked) => {
      pending = false
      if (unlocked || engine.state === 'unsupported') remove()
    })
  }

  for (const type of GESTURES) target.addEventListener(type, onGesture, { passive: true })
  return remove
}
