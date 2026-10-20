import type { Zone } from '../domain/zones'

export type ZoneGesture = 'still' | 'buzz' | 'fly' | 'pain' | 'rest'

/** Which little bow-and-arrow gesture of sheet 05 each zone shows. */
export function zoneGesture(zone: Zone): ZoneGesture {
  switch (zone) {
    case 'target':
      return 'fly'
    case 'approach':
    case 'near':
      return 'buzz'
    case 'overshoot':
    case 'pain':
      return 'pain'
    case 'rest':
      return 'rest'
    default:
      return 'still'
  }
}
