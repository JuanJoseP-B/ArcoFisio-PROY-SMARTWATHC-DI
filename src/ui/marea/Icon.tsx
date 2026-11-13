interface IconDef {
  paths: readonly string[]
  circles?: readonly (readonly [number, number])[]
}

/** Stroke icons of the Marea set (handoff 02): 24 x 24, 2 px stroke, round caps, `currentColor`. */
const ICONS = {
  measure: { paths: ['M3 19h18M5 19a7 7 0 0 1 14 0M12 19l4-6'] },
  sensorOff: { paths: ['M3 19h18M5 19a7 7 0 0 1 14 0M12 19l4-6', 'M4 4l16 16'] },
  play: { paths: ['M8 5l11 7-11 7z'] },
  routines: { paths: ['M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'] },
  pain: { paths: ['M3 19a9 9 0 0 1 18 0', 'M12 8v4M12 15.5v.01'] },
  history: { paths: ['M6 20V12M12 20V5M18 20v-9'] },
  guide: { paths: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'] },
  settings: {
    paths: ['M4 8h10M18 8h2M4 16h2M10 16h10'],
    circles: [
      [16, 8],
      [8, 16],
    ],
  },
  check: { paths: ['M5 12.5l4.5 4.5L19 7'] },
  alert: { paths: ['M12 4l9 16H3z', 'M12 10v4M12 17v.01'] },
  plus: { paths: ['M12 5v14M5 12h14'] },
  minus: { paths: ['M5 12h14'] },
} as const satisfies Record<string, IconDef>

export type IconName = keyof typeof ICONS

interface IconProps {
  name: IconName
  /** Size in px (the handoff uses 16 in pills, 24 by default, 26 in the menu, 28 in steppers). */
  size?: number
  className?: string
}

/** Decorative by default: the control that holds it carries the accessible name. */
export function Icon({ name, size = 24, className }: IconProps) {
  const icon: IconDef = ICONS[name]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      data-icon={name}
      style={{ flex: 'none' }}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
      {icon.circles?.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />
      ))}
    </svg>
  )
}
