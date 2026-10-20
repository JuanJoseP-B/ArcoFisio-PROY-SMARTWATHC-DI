import { useEffect } from 'react'
import type { Lang } from '../../data'
import { usePrefersReducedMotion } from '../../design/reducedMotion'
import { loadBrandFont } from '../../design/fonts'
import { useFrameClock } from '../../design/useFrameClock'
import { introCopy } from './copy'
import styles from './Intro.module.css'
import { INTRO_BRAND_PROGRESS, INTRO_PERIOD_MS, introFrame } from './frame'
import { IntroScene } from './IntroScene'
import { Wordmark } from './Wordmark'

interface IntroProps {
  lang: Lang
}

/**
 * Sheet 01: the archer draws, looses the arrow, an iris opens and the brand ring draws.
 * Runs on requestAnimationFrame as a 9 s loop. With reduced motion it shows the finished
 * lockup with a single fade instead.
 */
export function Intro({ lang }: IntroProps) {
  const reduced = usePrefersReducedMotion()
  const elapsed = useFrameClock(!reduced)

  useEffect(() => {
    loadBrandFont()
  }, [])

  const frame = introFrame(reduced ? INTRO_BRAND_PROGRESS * INTRO_PERIOD_MS : elapsed)

  return (
    <div
      className={reduced ? `${styles.intro} ${styles.still}` : styles.intro}
      data-part="intro"
      data-motion={reduced ? 'reduced' : 'full'}
    >
      <IntroScene frame={frame} />
      <Wordmark
        tagline={introCopy[lang].tagline}
        opacity={frame.wordmarkOpacity}
        shift={frame.wordmarkShift}
      />
    </div>
  )
}
