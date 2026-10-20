import { describe, expect, it } from 'vitest'
import { MAX_TIPS, buildGuide } from './guide'
import type { GuideSession, GuideTip } from './guide'

const ARC = { from: 70, to: 110 }

/** A clean session on a 90° routine: every repetition held, no overshoot, no pain. */
const session = (over: Partial<GuideSession> = {}): GuideSession => ({
  routineId: 'r1',
  maxAngle: 90,
  overshoots: 0,
  painEntries: 0,
  reps: [
    { peak: 90, held: true },
    { peak: 91, held: true },
  ],
  ...over,
})

const guide = (sessions: GuideSession[], painArc = ARC as typeof ARC | null): GuideTip[] =>
  buildGuide({ sessions, painArc, targetOf: (id) => (id === 'r1' ? 90 : undefined) })

const ids = (tips: GuideTip[]) => tips.map((tip) => tip.id)

describe('buildGuide: without sessions', () => {
  it('invites the first session', () => {
    expect(ids(guide([]))).toEqual(['first'])
  })

  it('also suggests marking the painful arc when there is none', () => {
    expect(ids(guide([], null))).toEqual(['first', 'markPain'])
  })
})

describe('buildGuide: pain', () => {
  it('warns about entering the painful arc, with how many times', () => {
    const tips = guide([session({ painEntries: 2 })])
    expect(tips[0]).toEqual({ id: 'pain', tone: 'warn', params: { count: 2 } })
  })

  it('does not mention pain when the arm stayed out of the arc', () => {
    expect(ids(guide([session()]))).not.toContain('pain')
  })

  it('suggests the physiotherapist after pain in three sessions in a row', () => {
    const hurt = session({ painEntries: 1 })
    const tips = guide([hurt, hurt, hurt])
    expect(tips[0]?.id).toBe('painTrend')
    expect(ids(tips)).not.toContain('pain')
  })

  it('does not call it a trend when one of the three was clean', () => {
    const hurt = session({ painEntries: 1 })
    expect(ids(guide([hurt, session(), hurt]))).toContain('pain')
    expect(ids(guide([hurt, session(), hurt]))).not.toContain('painTrend')
  })

  it('does not call it a trend with fewer than three sessions', () => {
    const hurt = session({ painEntries: 1 })
    expect(ids(guide([hurt, hurt]))).toEqual(['pain'])
  })
})

describe('buildGuide: reaching the target', () => {
  it('warns about passing the target, with how many times', () => {
    const tips = guide([session({ overshoots: 3 })])
    expect(tips.find((tip) => tip.id === 'overshoot')?.params).toEqual({ count: 3 })
  })

  it('says the target was not reached when the best reach fell short of it', () => {
    const tips = guide([session({ maxAngle: 80 })])
    expect(tips.find((tip) => tip.id === 'shortRange')?.params).toEqual({ target: 90, max: 80 })
  })

  it('lets a reach within three degrees of the target pass', () => {
    expect(ids(guide([session({ maxAngle: 87 })]))).not.toContain('shortRange')
    expect(ids(guide([session({ maxAngle: 86.9 })]))).toContain('shortRange')
  })

  it('skips the target check when the routine no longer exists', () => {
    expect(ids(guide([session({ routineId: 'gone', maxAngle: 20 })]))).not.toContain('shortRange')
  })

  it('asks for a longer hold when fewer than 70% of the repetitions were held', () => {
    const reps = [
      { peak: 90, held: true },
      { peak: 90, held: false },
      { peak: 90, held: false },
    ]
    const tips = guide([session({ reps })])
    expect(tips.find((tip) => tip.id === 'unheld')?.params).toEqual({ held: 1, total: 3 })
  })

  it('does not ask for it at exactly 70% held', () => {
    const reps = Array.from({ length: 10 }, (_, i) => ({ peak: 90, held: i < 7 }))
    expect(ids(guide([session({ reps })]))).not.toContain('unheld')
  })

  it('does not ask for it when the session had no repetitions', () => {
    expect(ids(guide([session({ reps: [] })]))).not.toContain('unheld')
  })
})

describe('buildGuide: comparing with the session before', () => {
  it('celebrates a range that grew by three degrees or more', () => {
    const tips = guide([session({ maxAngle: 95 }), session({ maxAngle: 90 })])
    expect(tips.find((tip) => tip.id === 'improved')).toEqual({
      id: 'improved',
      tone: 'good',
      params: { delta: 5 },
    })
  })

  it('stays quiet about a gain of less than three degrees', () => {
    expect(ids(guide([session({ maxAngle: 91 }), session({ maxAngle: 90 })]))).not.toContain(
      'improved',
    )
  })

  it('warns about a range that fell by five degrees or more', () => {
    const tips = guide([session({ maxAngle: 85 }), session({ maxAngle: 92 })])
    expect(tips.find((tip) => tip.id === 'declined')?.params).toEqual({ delta: 7 })
    expect(ids(tips)).not.toContain('improved')
  })

  it('stays quiet about a loss of less than five degrees', () => {
    expect(ids(guide([session({ maxAngle: 88 }), session({ maxAngle: 92 })]))).not.toContain(
      'declined',
    )
  })

  it('has nothing to compare with after a single session', () => {
    const found = ids(guide([session({ maxAngle: 120 })]))
    expect(found).not.toContain('improved')
    expect(found).not.toContain('declined')
  })
})

describe('buildGuide: the whole picture', () => {
  it('congratulates a clean session', () => {
    expect(ids(guide([session()]))).toEqual(['steady'])
  })

  it('does not congratulate a session with a pass or pain', () => {
    expect(ids(guide([session({ overshoots: 1 })]))).not.toContain('steady')
    expect(ids(guide([session({ painEntries: 1 })]))).not.toContain('steady')
  })

  it('suggests marking the painful arc when none is saved', () => {
    expect(ids(guide([session()], null))).toEqual(['steady', 'markPain'])
  })

  it('always says something, even for a session with no repetitions', () => {
    expect(ids(guide([session({ reps: [] })]))).toEqual(['keepGoing'])
  })

  it('puts warnings before encouragement', () => {
    const tips = guide([
      session({ maxAngle: 100, painEntries: 1, overshoots: 1 }),
      session({ maxAngle: 90 }),
    ])
    expect(ids(tips)).toEqual(['pain', 'overshoot', 'improved'])
  })

  it('gives at most four tips', () => {
    const reps = [
      { peak: 80, held: false },
      { peak: 80, held: false },
    ]
    const tips = guide(
      [session({ maxAngle: 70, painEntries: 1, overshoots: 1, reps }), session({ maxAngle: 80 })],
      null,
    )
    expect(tips.length).toBe(MAX_TIPS)
    expect(ids(tips)).toEqual(['pain', 'overshoot', 'shortRange', 'declined'])
  })

  it('reads only the latest session for its tips', () => {
    const tips = guide([session(), session({ painEntries: 5, overshoots: 5 })])
    expect(ids(tips)).toEqual(['steady'])
  })
})
