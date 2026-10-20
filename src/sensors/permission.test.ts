import { describe, expect, it, vi } from 'vitest'
import { requestMotionPermission } from './permission'

const withPermission = (result: () => Promise<string>) =>
  Object.assign(function DeviceMotionEvent() {}, { requestPermission: vi.fn(result) })

describe('requestMotionPermission', () => {
  it('is unsupported without DeviceMotionEvent', async () => {
    expect(await requestMotionPermission({ isSecureContext: true })).toBe('unsupported')
  })

  it('is unsupported on an insecure origin', async () => {
    const env = { isSecureContext: false, DeviceMotionEvent: function DeviceMotionEvent() {} }
    expect(await requestMotionPermission(env)).toBe('unsupported')
  })

  it('is granted without prompting when the API has no permission step', async () => {
    const env = { isSecureContext: true, DeviceMotionEvent: function DeviceMotionEvent() {} }
    expect(await requestMotionPermission(env)).toBe('granted')
  })

  it('calls requestPermission and maps granted', async () => {
    const ctor = withPermission(() => Promise.resolve('granted'))
    expect(await requestMotionPermission({ isSecureContext: true, DeviceMotionEvent: ctor })).toBe(
      'granted',
    )
    expect(ctor.requestPermission).toHaveBeenCalledTimes(1)
  })

  it('maps a refusal to denied', async () => {
    const ctor = withPermission(() => Promise.resolve('denied'))
    expect(await requestMotionPermission({ isSecureContext: true, DeviceMotionEvent: ctor })).toBe(
      'denied',
    )
  })

  it('maps a rejected prompt to denied', async () => {
    const ctor = withPermission(() => Promise.reject(new Error('not a user gesture')))
    expect(await requestMotionPermission({ isSecureContext: true, DeviceMotionEvent: ctor })).toBe(
      'denied',
    )
  })
})
