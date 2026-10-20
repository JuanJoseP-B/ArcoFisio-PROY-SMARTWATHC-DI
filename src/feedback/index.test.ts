import { describe, expect, it } from 'vitest'
import { getFeedback } from './index'

describe('getFeedback', () => {
  it('is one shared instance for the whole app', () => {
    expect(getFeedback()).toBe(getFeedback())
  })

  it('starts locked and quiet until a gesture unlocks the audio', () => {
    const feedback = getFeedback()
    expect(feedback.audio.state).toBe('locked')
    expect(feedback.audio.play('success')).toBe(false)
  })
})
