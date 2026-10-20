import { describe, expect, it } from 'vitest'
import { geometry } from '../design/tokens'
import { ARROW_LENGTH, BOW_PULL_PX, BOW_TIP_Y, grassBlades, restGeometry } from './restGeometry'

describe('restGeometry', () => {
  it('starts with a full ring and the string at rest', () => {
    expect(restGeometry(0)).toMatchObject({ dashOffset: 0, pullY: BOW_TIP_Y })
  })

  it('empties the ring and draws the string back as the rest runs', () => {
    const half = restGeometry(0.5)
    expect(half.dashOffset).toBeCloseTo(geometry.ringCircumference / 2, 1)
    expect(half.pullY).toBe(BOW_TIP_Y + BOW_PULL_PX / 2)
    expect(restGeometry(1)).toMatchObject({
      dashOffset: geometry.ringCircumference,
      pullY: BOW_TIP_Y + BOW_PULL_PX,
    })
  })

  it('keeps the arrow on the string, with its point a fixed length ahead', () => {
    const { nockY, pullY, tipY, tailY } = restGeometry(0.4)
    expect(nockY).toBe(pullY)
    expect(pullY - tipY).toBe(ARROW_LENGTH)
    expect(tailY).toBe(tipY + 10)
  })

  it('stays inside 0 to 1', () => {
    expect(restGeometry(-2)).toEqual(restGeometry(0))
    expect(restGeometry(7)).toEqual(restGeometry(1))
  })

  it('draws the 27 blades of the sheet, the first and the last where the sheet puts them', () => {
    const blades = grassBlades()
    expect(blades).toHaveLength(27)
    expect(blades[0]?.d).toBe('M20 384 Q24 340 28 338')
    expect(blades[1]?.d).toBe('M33 384 Q37 340 27 339')
    expect(blades[10]?.d).toBe('M150 384 Q154 340 144 318')
    expect(blades[26]?.d).toBe('M358 384 Q362 340 366 334')
  })
})
