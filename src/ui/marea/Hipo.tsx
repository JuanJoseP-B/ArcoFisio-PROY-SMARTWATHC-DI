interface HipoProps {
  /** Width in px; the height follows the 84 x 138 viewBox of the handoff's `hipo.svg`. */
  width?: number
  /** Accessible name. Without it Hipo is decoration and hidden from assistive technology. */
  label?: string
  className?: string
}

const VIEW_W = 84
const VIEW_H = 138

/**
 * Hipo, the seahorse mascot (handoff 02). It appears on loading, welcome, empty states and
 * the guide, never during an exercise. Colors come from the Marea variables.
 */
export function Hipo({ width = 116, label, className }: HipoProps) {
  return (
    <svg
      viewBox={`14 2 ${VIEW_W} ${VIEW_H}`}
      width={width}
      height={Math.round((width * VIEW_H) / VIEW_W)}
      className={className}
      data-part="hipo"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M62 22l-4-11M70 20l2-12M77 25l9-9"
          stroke="var(--af-marea-accent)"
          strokeWidth="4"
        />
        <path
          d="M62 42C46 56 42 80 56 98c10 12 6 28-8 32-12 3-18-9-8-14"
          stroke="var(--af-marea-accent)"
          strokeWidth="15"
        />
        <path
          d="M62 42C46 56 42 80 56 98c10 12 6 28-8 32-12 3-18-9-8-14"
          stroke="var(--af-marea-on-accent)"
          strokeWidth="15"
          strokeDasharray="1.6 8"
          strokeLinecap="butt"
          opacity=".55"
        />
      </g>
      <path
        d="M60 66C80 62 92 76 86 86 80 96 68 96 62 96Z"
        fill="var(--af-marea-accent)"
        opacity=".5"
      />
      <ellipse cx="66" cy="34" rx="16" ry="14" fill="var(--af-marea-accent)" />
      <rect
        x="24"
        y="33"
        width="38"
        height="9"
        rx="4.5"
        fill="var(--af-marea-accent)"
        transform="rotate(10 60 36)"
      />
      <circle cx="70" cy="31" r="3.6" fill="var(--af-marea-on-accent)" />
      <circle cx="70.8" cy="31.2" r="1.7" fill="var(--af-marea-ink)" />
    </svg>
  )
}
