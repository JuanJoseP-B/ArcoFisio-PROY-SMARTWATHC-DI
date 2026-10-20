import { describe, expect, it, vi } from 'vitest'
import { computeAngle } from '../domain/angle'
import { SimulatedSource, gravityForAngle } from './SimulatedSource'

const hanging = { gravityRef: gravityForAngle(0) }

describe('gravityForAngle', () => {
  it.each([0, 30, 90, 150, 180])('round-trips %i degrees through computeAngle', (degrees) => {
    expect(computeAngle(gravityForAngle(degrees), hanging)).toBeCloseTo(degrees, 6)
  })
})

describe('SimulatedSource', () => {
  it('emits the current angle as soon as it starts', () => {
    const source = new SimulatedSource()
    const listener = vi.fn()
    source.onSample(listener)
    source.setAngle(45)
    expect(listener).not.toHaveBeenCalled()

    source.start()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(computeAngle(listener.mock.calls[0]![0], hanging)).toBeCloseTo(45, 6)
  })

  it('emits on every setAngle while running and stays silent when stopped', () => {
    const source = new SimulatedSource()
    const listener = vi.fn()
    source.onSample(listener)
    source.start()
    source.setAngle(90)
    expect(listener).toHaveBeenCalledTimes(2)

    source.stop()
    source.setAngle(10)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('clamps the angle to 0..180', () => {
    const source = new SimulatedSource()
    source.setAngle(-20)
    expect(source.currentAngle).toBe(0)
    source.setAngle(400)
    expect(source.currentAngle).toBe(180)
  })

  it('does not start twice and supports unsubscribe', () => {
    const source = new SimulatedSource()
    const listener = vi.fn()
    const unsubscribe = source.onSample(listener)
    source.start()
    source.start()
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    source.setAngle(20)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('is in sim mode and always grants permission', async () => {
    const source = new SimulatedSource()
    expect(source.mode).toBe('sim')
    expect(await source.requestPermission()).toBe('granted')
  })
})
