import styles from './Wordmark.module.css'

interface WordmarkProps {
  /** Font size of "Arco" in px; "Fisio" is a little larger, as in the handoff (34 / 38). */
  size?: number
}

/** "Arco" in DM Sans bold and "Fisio" in Newsreader italic, in the deep blue. The brand mark, not a sentence. */
export function Wordmark({ size = 34 }: WordmarkProps) {
  return (
    <span className={styles.wordmark} style={{ fontSize: size }} data-part="wordmark">
      Arco <span className={styles.fisio}>Fisio</span>
    </span>
  )
}
