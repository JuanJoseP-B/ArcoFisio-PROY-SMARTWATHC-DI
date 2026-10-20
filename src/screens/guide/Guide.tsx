import { useMemo, useState } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { buildGuide } from '../../domain/guide'
import type { GuideTone } from '../../domain/guide'
import type { Zone } from '../../domain/zones'
import type { MessageKey } from '../../i18n/translate'
import { FeatherFan } from '../../ui/FeatherFan'
import { IconButton } from '../../ui/IconButton'
import { ZoneChip } from '../../ui/ZoneChip'
import { useNav } from '../navigation/useNav'
import styles from './Guide.module.css'
import { tipMessage } from './tipMessage'

/** Sessions the guide reads: the latest gives the tips, the ones before it the trend. */
const SESSIONS_READ = 5

const TONE_ZONE: Record<GuideTone, Zone> = { warn: 'approach', good: 'target', info: 'far' }
const TONE_WORD: Record<GuideTone, MessageKey> = {
  warn: 'guide.tone.warn',
  good: 'guide.tone.good',
  info: 'guide.tone.info',
}

/**
 * AI Guide: advice from the saved sessions and the painful arc, by local rules (no outside
 * service). One tip at a time, the most important first, with a button for the next one.
 */
export function Guide() {
  const { t, lang } = useI18n()
  const nav = useNav()
  const [shown, setShown] = useState(0)

  const tips = useMemo(() => {
    const data = getDataLayer()
    return buildGuide({
      sessions: data.sessions.recent(SESSIONS_READ),
      painArc: data.painArc.get(),
      targetOf: (id) => data.routines.get(id)?.targetAngle,
    })
  }, [])

  const tip = tips[shown % tips.length]!
  const message = tipMessage(tip, lang)

  return (
    <div className={styles.guide} data-part="guide" data-tip={tip.id}>
      <FeatherFan />
      <div className={styles.content}>
        <h1 className={styles.title}>{t('launcher.guide')}</h1>
        <ZoneChip zone={TONE_ZONE[tip.tone]} label={t(TONE_WORD[tip.tone])} icon={false} />
        <p className={styles.tip} data-part="guide-tip" role="status">
          {t(message.key, message.params)}
        </p>
        <div className={styles.counter} data-part="guide-counter">
          {t('session.progress', { done: (shown % tips.length) + 1, total: tips.length })}
        </div>
      </div>
      <div className={styles.actions}>
        <IconButton icon="back" label={t('nav.back')} onPress={nav.back} />
        {tips.length > 1 ? (
          <IconButton icon="next" label={t('guide.next')} onPress={() => setShown((n) => n + 1)} />
        ) : null}
      </div>
    </div>
  )
}
