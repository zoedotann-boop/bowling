/**
 * Decorative retro glyphs — Pin, Ball, Burst. All aria-hidden by default.
 * Colors accept any CSS value (hex, oklch, or CSS var) so callers can pass
 * tokens via `var(--red)` or Tailwind arbitrary values.
 */

export function Pin({
  color = "#fff",
  stripe = "var(--red)",
  size = 36,
  className,
}: {
  color?: string
  stripe?: string
  size?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size * 1.55}
      viewBox="0 0 40 62"
      className={className}
    >
      <path
        d="M20 2 C 11 2 9 14 11 24 C 5 30 5 52 20 60 C 35 52 35 30 29 24 C 31 14 29 2 20 2Z"
        fill={color}
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <rect x="11" y="16" width="18" height="3" fill={stripe} />
      <rect x="11" y="22" width="18" height="3" fill={stripe} />
    </svg>
  )
}

export function Ball({
  color = "var(--turq)",
  size = 40,
  className,
}: {
  color?: string
  size?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill={color}
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <circle cx="14" cy="15" r="2" fill="var(--ink)" />
      <circle cx="20" cy="12.5" r="2" fill="var(--ink)" />
      <circle cx="17.5" cy="19" r="2" fill="var(--ink)" />
    </svg>
  )
}

export function Burst({
  color = "var(--yellow)",
  size = 80,
  className,
}: {
  color?: string
  size?: number
  className?: string
}) {
  const lines = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return {
      x1: 50 + Math.cos(a) * 18,
      y1: 50 + Math.sin(a) * 18,
      x2: 50 + Math.cos(a) * 48,
      y2: 50 + Math.sin(a) * 48,
    }
  })
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
