import { describe, expect, it } from 'vitest'
import { HEX_CELLS } from '../../ui/hexLayout'
import { routeForLauncher } from './targets'

describe('routeForLauncher', () => {
  it('sends Session through the exercise selector', () => {
    expect(routeForLauncher('session')).toEqual({ id: 'mode' })
  })

  it('opens every other app on its own screen', () => {
    for (const id of ['measure', 'routines', 'summary', 'pain', 'guide', 'settings'] as const) {
      expect(routeForLauncher(id)).toEqual({ id })
    }
  })

  it('leads every launcher cell somewhere', () => {
    for (const cell of HEX_CELLS) expect(routeForLauncher(cell.id).id).toBeTruthy()
  })
})
