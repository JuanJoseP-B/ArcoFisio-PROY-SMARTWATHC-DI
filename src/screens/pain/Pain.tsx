import { useState } from 'react'
import { useAngle } from '../../app/useAngle'
import { useI18n } from '../../app/useI18n'
import { getDataLayer } from '../../data'
import { IDLE_MARKING, finishMarking, liveArc, startMarking } from '../../domain/painMarking'
import type { PainMarking } from '../../domain/painMarking'
import { isInPainArc } from '../../domain/zones'
import type { PainArc } from '../../domain/zones'
import type { SensorKit } from '../../sensors/kit'
import { BackButton } from '../../ui/BackButton'
import { FeatherFan } from '../../ui/FeatherFan'
import { GoniometerRing } from '../../ui/GoniometerRing'
import { IconButton } from '../../ui/IconButton'
import { PillButton } from '../../ui/PillButton'
import { ZoneChip } from '../../ui/ZoneChip'
import { SensorSteps } from '../measure/SensorSteps'
import { stepFor } from '../measure/measureFlow'
import { useNav } from '../navigation/useNav'
import styles from './Pain.module.css'

interface PainProps {
  /** Injected in tests; the app-wide sensor kit is used otherwise. */
  kit?: SensorKit
}

/**
 * Painful arc (sheet 04). With the angle live, the person moves the arm to where the pain
 * starts and taps, then moves on to where it ends and taps again; the band grows between the
 * two and the arc is saved at once. Until the sensor is ready it asks for it like Measure does.
 */
export function Pain({ kit }: PainProps) {
  const { t } = useI18n()
  const nav = useNav()
  const { painArc: repo } = getDataLayer()
  const { angle, status, actions } = useAngle(kit ? { kit } : {})
  const [saved, setSaved] = useState<PainArc | null>(() => repo.get())
  const [marking, setMarking] = useState<PainMarking>(IDLE_MARKING)
  const [tooNarrow, setTooNarrow] = useState(false)

  if (stepFor(status) !== 'range') {
    return (
      <div className={styles.steps} data-part="pain" data-mode="steps">
        <BackButton label={t('nav.back')} onBack={nav.back} />
        <SensorSteps status={status} actions={actions} />
      </div>
    )
  }

  const current = angle ?? 0
  const marks = marking.phase === 'marking'
  const arc = marks ? liveArc(marking, current) : saved
  const inPain = isInPainArc(current, arc)

  const press = () => {
    if (!marks) {
      setTooNarrow(false)
      setMarking(startMarking(current))
      return
    }
    const done = finishMarking(marking, current)
    setMarking(IDLE_MARKING)
    setTooNarrow(done === null)
    if (done && repo.set(done)) setSaved(done)
  }

  const clear = () => {
    repo.set(null)
    setSaved(null)
    setTooNarrow(false)
  }

  const range = arc ? t('zone.painRange', { from: arc.from, to: arc.to }) : null
  const note = tooNarrow
    ? t('pain.tooNarrow')
    : marks
      ? t('pain.hintEnd')
      : (range ?? t('pain.hintStart'))

  return (
    <div className={styles.pain} data-part="pain" data-mode="range" data-marking={marks}>
      <FeatherFan />
      <GoniometerRing
        angle={angle ?? 0}
        target={null}
        zone={inPain ? 'pain' : null}
        painArc={arc}
      />
      <div className={styles.readout}>
        <div className={styles.title}>{t('pain.title')}</div>
        <div className={styles.angle} data-part="angle">
          {angle === null ? '--' : Math.round(angle)}°
        </div>
        {arc ? (
          inPain ? (
            <ZoneChip zone="pain" label={t('zone.pain')} />
          ) : (
            <ZoneChip zone="target" label={t('pain.clean')} icon={false} />
          )
        ) : null}
        <div className={styles.note} role="status" data-part="pain-note">
          {note}
        </div>
      </div>
      <div className={styles.mark}>
        <PillButton
          variant="secondary"
          label={marks ? t('pain.end') : t('pain.start')}
          onPress={press}
        />
      </div>
      <div className={styles.actions}>
        <IconButton icon="back" label={t('nav.back')} onPress={nav.back} />
        {marks ? (
          <IconButton
            icon="reset"
            label={t('pain.cancel')}
            onPress={() => setMarking(IDLE_MARKING)}
          />
        ) : saved ? (
          <IconButton icon="trash" label={t('pain.clear')} onPress={clear} />
        ) : null}
      </div>
    </div>
  )
}
