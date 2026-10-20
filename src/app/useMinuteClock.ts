import { useEffect, useRef, useState } from 'react'

const MS_PER_MINUTE = 60_000
/** Wake a hair after the minute changes so the new minute is what gets read. */
const MARGIN_MS = 20

/** Milliseconds until the next minute starts, counted from `date`. */
export function msToNextMinute(date: Date): number {
  return MS_PER_MINUTE - (date.getSeconds() * 1000 + date.getMilliseconds()) + MARGIN_MS
}

/**
 * The current time, refreshed once at the start of every minute. It sleeps with one timeout
 * until the next minute instead of polling, so the watch face costs nothing in between.
 */
export function useMinuteClock(now: () => Date = () => new Date()): Date {
  const read = useRef(now)
  const [date, setDate] = useState<Date>(now)

  useEffect(() => {
    read.current = now
  })

  useEffect(() => {
    const handle = setTimeout(() => setDate(read.current()), msToNextMinute(date))
    return () => clearTimeout(handle)
  }, [date])

  return date
}
