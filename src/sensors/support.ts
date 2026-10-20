export interface MotionEnv {
  isSecureContext?: boolean
  DeviceMotionEvent?: unknown
}

export interface SensorSupport {
  secureContext: boolean
  hasDeviceMotion: boolean
  needsPermission: boolean
  usable: boolean
}

export function hasPermissionApi(
  ctor: unknown,
): ctor is { requestPermission: () => Promise<string> } {
  return (
    typeof ctor === 'function' &&
    typeof (ctor as { requestPermission?: unknown }).requestPermission === 'function'
  )
}

export function detectSupport(env: MotionEnv = globalThis): SensorSupport {
  const secureContext = env.isSecureContext === true
  const hasDeviceMotion = typeof env.DeviceMotionEvent !== 'undefined'
  return {
    secureContext,
    hasDeviceMotion,
    needsPermission: hasPermissionApi(env.DeviceMotionEvent),
    usable: secureContext && hasDeviceMotion,
  }
}
