import { useState } from 'react'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { loadConfig, saveConfig } from '../../data/quickConfig'
import type { Exercise } from '../../data/types'
import { AngleWheel } from '../../ui/AngleWheel'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { FeatherFan } from '../../ui/FeatherFan'
import { useNav } from '../navigation/useNav'

interface ConfigProps {
  exercise: Exercise
}

/**
 * First half of Configuration: the angle wheel sets the target (sheet 03). Every detent is
 * saved at once, so the target survives closing the browser; the check mark moves on to the
 * counts.
 */
export function Config({ exercise }: ConfigProps) {
  const { t } = useI18n()
  const nav = useNav()
  const [config, setConfig] = useState(() => loadConfig(getDataLayer(), exercise))

  const changeTarget = (target: number) => {
    const next = { ...config, target }
    setConfig(next)
    saveConfig(getDataLayer(), exercise, next)
  }

  return (
    <div data-part="config" data-exercise={exercise}>
      <FeatherFan />
      <AngleWheel
        value={config.target}
        onChange={changeTarget}
        title={t('config.target')}
        caption={t('config.detents')}
      />
      <ConfirmButton
        label={t('config.next')}
        onConfirm={() => nav.push({ id: 'counts', exercise })}
      />
    </div>
  )
}
