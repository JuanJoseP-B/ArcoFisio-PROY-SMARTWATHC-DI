import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../design/reducedMotion'
import { loadBrandFont } from '../../design/fonts'
import { useFrameClock } from '../../design/useFrameClock'
import { useI18n } from '../../app/useI18n'
import styles from './Intro.module.css'
import {
  INTRO_BRAND_PROGRESS,
  INTRO_END_MS,
  INTRO_PERIOD_MS,
  INTRO_REDUCED_HOLD_MS,
  introFrame,
} from './frame'
import { IntroScene } from './IntroScene'
import { Wordmark } from './Wordmark'

interface IntroProps {
  /**
   * Plays the intro once and calls this when it ends (or when it is tapped to skip).
   * Without it the intro loops every 9 s, as in the preview of sheet 01.
   */
  onDone?: () => void
}

/**
 * Sheet 01: the archer draws, looses the arrow, an iris opens and the brand ring draws.
 * Runs on requestAnimationFrame. With reduced motion it shows the finished lockup with a
 * single fade instead.
 */
export function Intro({ onDone }: IntroProps) {
  const { t } = useI18n()
  const reduced = usePrefersReducedMotion()
  const playOnce = onDone !== undefined
  // Reduced motion draws one still frame; it only needs the clock to know when to move on.
  const elapsed = useFrameClock(!reduced || playOnce)
  const finished = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    loadBrandFont()
  }, [])

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onDoneRef.current?.()
  }

  const limit = reduced ? INTRO_REDUCED_HOLD_MS : INTRO_END_MS
  useEffect(() => {
    onDoneRef.current = onDone
    if (playOnce && elapsed >= limit) finish()
  })

  const played = playOnce ? Math.min(elapsed, INTRO_END_MS) : elapsed
  const frame = introFrame(reduced ? INTRO_BRAND_PROGRESS * INTRO_PERIOD_MS : played)

  return (
    <div
      className={reduced ? `${styles.intro} ${styles.still}` : styles.intro}
      data-part="intro"
      data-motion={reduced ? 'reduced' : 'full'}
    >
      <IntroScene frame={frame} />
      <Wordmark
        tagline={t('intro.tagline')}
        opacity={frame.wordmarkOpacity}
        shift={frame.wordmarkShift}
      />
      {playOnce ? (
        <button
          type="button"
          className={styles.skip}
          aria-label={t('intro.skip')}
          data-part="intro-skip"
          onClick={finish}
        />
      ) : null}
    </div>
  )
}
