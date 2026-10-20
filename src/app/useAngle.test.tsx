import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { createCalibrationRepo } from '../data/calibrationRepo'
import { createStorage } from '../data/storage'
import { FakeStorage } from '../data/testStorage'
import { createSensorKit } from '../sensors/kit'
import type { UseAngle } from './useAngle'
import { useAngle } from './useAngle'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
})

function mount(kit: ReturnType<typeof createSensorKit>, autoStart = true) {
  const latest: { current: UseAngle | null } = { current: null }
  function Probe() {
    latest.current = useAngle({ kit, autoStart })
    return null
  }
  const root = createRoot(document.createElement('div'))
  roots.push(root)
  act(() => root.render(createElement(Probe)))
  return { latest, root }
}

const newKit = () => createSensorKit('sim', createCalibrationRepo(createStorage(new FakeStorage())))

describe('useAngle', () => {
  it('starts the sensor on mount and follows the angle', () => {
    const kit = newKit()
    const { latest } = mount(kit)
    expect(latest.current?.status).toBe('live')

    act(() => {
      for (let i = 0; i < 80; i += 1) kit.simulated?.setAngle(90)
    })
    expect(latest.current?.angle).toBeCloseTo(90, 0)
    expect(latest.current?.mode).toBe('sim')
  })

  it('stops the sensor on unmount', () => {
    const kit = newKit()
    const { root } = mount(kit)
    act(() => root.unmount())
    roots.length = 0
    expect(kit.tracker.getSnapshot().status).toBe('idle')
  })

  it('keeps reading until the last consumer unmounts', () => {
    const kit = newKit()
    const first = mount(kit)
    mount(kit)
    act(() => first.root.unmount())
    expect(kit.tracker.getSnapshot().status).toBe('live')
  })

  it('does not start when autoStart is false', () => {
    const kit = newKit()
    const { latest } = mount(kit, false)
    expect(latest.current?.status).toBe('idle')
  })

  it('exposes permission and calibration actions', async () => {
    const kit = newKit()
    const { latest } = mount(kit)
    expect(await latest.current?.actions.requestPermission()).toBe('granted')

    const pending = latest.current?.actions.calibrate()
    act(() => {
      for (let i = 0; i < 25; i += 1) kit.simulated?.setAngle(0)
    })
    expect((await pending)?.ok).toBe(true)
  })
})
