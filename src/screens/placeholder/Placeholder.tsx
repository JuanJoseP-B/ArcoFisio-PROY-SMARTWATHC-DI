import { useI18n } from '../../app/useI18n'
import type { MessageKey } from '../../i18n/translate'
import { BackButton } from '../../ui/BackButton'
import { useNav } from '../navigation/useNav'
import styles from './Placeholder.module.css'

interface PlaceholderProps {
  title: MessageKey
}

/**
 * Stand-in for a screen a later stage builds. It keeps the launcher honest: every cell leads
 * somewhere and the way back works. Each stage replaces its placeholder with the real screen.
 */
export function Placeholder({ title }: PlaceholderProps) {
  const { t } = useI18n()
  const nav = useNav()

  return (
    <div className={styles.placeholder} data-part="placeholder">
      <BackButton label={t('nav.back')} onBack={nav.back} />
      <h1 className={styles.title}>{t(title)}</h1>
      <div className={styles.note}>{t('soon.note')}</div>
    </div>
  )
}
