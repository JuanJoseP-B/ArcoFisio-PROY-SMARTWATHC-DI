import { describe, expect, it } from 'vitest'
import { detectSupport, hasPermissionApi } from './support'

const plainCtor = function DeviceMotionEvent() {}
const iosCtor = Object.assign(function DeviceMotionEvent() {}, {
  requestPermission: () => Promise.resolve('granted'),
})

describe('hasPermissionApi', () => {
  it('detects the iOS permission function', () => {
    expect(hasPermissionApi(iosCtor)).toBe(true)
  })

  it('rejects constructors without it and non-functions', () => {
    expect(hasPermissionApi(plainCtor)).toBe(false)
    expect(hasPermissionApi(undefined)).toBe(false)
    expect(hasPermissionApi({ requestPermission: () => {} })).toBe(false)
  })
})

describe('detectSupport', () => {
  it('reports a secure Android-like environment as usable without a prompt', () => {
    expect(detectSupport({ isSecureContext: true, DeviceMotionEvent: plainCtor })).toEqual({
      secureContext: true,
      hasDeviceMotion: true,
      needsPermission: false,
      usable: true,
    })
  })

  it('reports an iOS-like environment as needing permission', () => {
    const support = detectSupport({ isSecureContext: true, DeviceMotionEvent: iosCtor })
    expect(support.needsPermission).toBe(true)
    expect(support.usable).toBe(true)
  })

  it('is not usable over plain HTTP', () => {
    const support = detectSupport({ isSecureContext: false, DeviceMotionEvent: plainCtor })
    expect(support.secureContext).toBe(false)
    expect(support.usable).toBe(false)
  })

  it('is not usable without DeviceMotionEvent', () => {
    const support = detectSupport({ isSecureContext: true })
    expect(support.hasDeviceMotion).toBe(false)
    expect(support.usable).toBe(false)
  })

  it('treats a missing isSecureContext as insecure', () => {
    expect(detectSupport({ DeviceMotionEvent: plainCtor }).secureContext).toBe(false)
  })
})
