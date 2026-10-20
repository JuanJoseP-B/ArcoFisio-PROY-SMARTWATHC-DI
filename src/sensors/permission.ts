import { hasPermissionApi } from './support'
import type { MotionEnv } from './support'
import type { PermissionResult } from './types'

/**
 * Must be called from a user gesture handler: iOS only shows the prompt
 * when requestPermission() runs inside a tap.
 */
export async function requestMotionPermission(
  env: MotionEnv = globalThis,
): Promise<PermissionResult> {
  const ctor = env.DeviceMotionEvent
  if (typeof ctor === 'undefined' || env.isSecureContext !== true) return 'unsupported'
  if (!hasPermissionApi(ctor)) return 'granted'

  try {
    return (await ctor.requestPermission()) === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'denied'
  }
}
