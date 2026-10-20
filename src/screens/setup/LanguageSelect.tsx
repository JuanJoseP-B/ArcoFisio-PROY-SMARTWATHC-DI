import { useI18n } from '../../app/useI18n'
import type { Lang } from '../../data/types'
import { PillButton } from '../../ui/PillButton'
import { useNav } from '../navigation/useNav'
import styles from './Setup.module.css'

const LANGUAGES: readonly Lang[] = ['es', 'en']

/**
 * First step of the first run: pick the language. The choice applies at once (the title
 * switches with it) and the sensor setup follows.
 */
export function LanguageSelect() {
  const { t, setLang } = useI18n()
  const nav = useNav()

  const choose = (lang: Lang) => {
    setLang(lang)
    nav.push({ id: 'setup' })
  }

  return (
    <div className={styles.setup} data-part="language-select">
      <h1 className={styles.title}>{t('setup.language')}</h1>
      {LANGUAGES.map((lang) => (
        <PillButton key={lang} label={t(`lang.${lang}`)} onPress={() => choose(lang)} />
      ))}
    </div>
  )
}
