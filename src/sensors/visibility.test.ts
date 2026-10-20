import { describe, expect, it, vi } from 'vitest'
import { SimulatedSource } from './SimulatedSource'
import { createAngleTracker } from './tracker'
import { bindVisibility } from './visibility'
import type { VisibilityDocument } from './visibility'

class FakeDocument implements VisibilityDocument {
  visibilityState = 'visible'
  private readonly handlers = new Set<() => void>()
  addEventListener(_type: 'visibilitychange', listener: () => void): void {
    this.handlers.add(listener)
  }
  removeEventListener(_type: 'visibilitychange', listener: () => void): void {
    this.handlers.delete(listener)
  }
  set(state: 'hidden' | 'visible'): void {
    this.visibilityState = state
    for (const handler of this.handlers) handler()
  }
  get listenerCount(): number {
    return this.handlers.size
  }
}

describe('bindVisibility', () => {
  it('pauses on hidden and resumes on visible', () => {
    const tracker = { pause: vi.fn(), resume: vi.fn() }
    const doc = new FakeDocument()
    bindVisibility(tracker, doc)

    doc.set('hidden')
    expect(tracker.pause).toHaveBeenCalledTimes(1)
    doc.set('visible')
    expect(tracker.resume).toHaveBeenCalledTimes(1)
  })

  it('stops listening after unbind', () => {
    const tracker = { pause: vi.fn(), resume: vi.fn() }
    const doc = new FakeDocument()
    const unbind = bindVisibility(tracker, doc)
    unbind()
    doc.set('hidden')
    expect(doc.listenerCount).toBe(0)
    expect(tracker.pause).not.toHaveBeenCalled()
  })

  it('drives a real tracker through hidden and visible', () => {
    const source = new SimulatedSource()
    const tracker = createAngleTracker(source)
    tracker.setCalibration({ gravityRef: [0, 0, 1] })
    tracker.start()
    const doc = new FakeDocument()
    bindVisibility(tracker, doc)

    doc.set('hidden')
    expect(tracker.getSnapshot().status).toBe('paused')
    doc.set('visible')
    expect(tracker.getSnapshot().status).toBe('live')
  })

  it('does not wake a tracker that was never started', () => {
    const tracker = createAngleTracker(new SimulatedSource())
    const doc = new FakeDocument()
    bindVisibility(tracker, doc)
    doc.set('hidden')
    doc.set('visible')
    expect(tracker.getSnapshot().status).toBe('idle')
  })
})
