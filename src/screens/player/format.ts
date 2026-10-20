/** Seconds as a clock reading: 30 -> "0:30", 125 -> "2:05". */
export function formatClock(totalSeconds: number): string {
  const whole = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(whole / 60)
  const seconds = whole % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Width in px of each set pill so that any number of sets (up to 20) fits in a row. */
export function pillWidth(sets: number): number {
  const room = Math.floor(160 / Math.max(1, sets)) - 6
  return Math.max(4, Math.min(28, room))
}
