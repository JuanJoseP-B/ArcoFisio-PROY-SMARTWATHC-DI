import { getDataLayer } from '../data'
import { createFeedback } from './feedback'
import type { Feedback } from './feedback'

let shared: Feedback | null = null

/** App-wide feedback, already set to the saved sound and vibration switches. */
export function getFeedback(): Feedback {
  if (!shared) {
    shared = createFeedback()
    shared.applySettings(getDataLayer().settings.get())
  }
  return shared
}

export type { Feedback } from './feedback'
