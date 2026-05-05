import { cn } from "@/lib/utils"

type Size = "xs" | "sm" | "md" | "lg"

type Spec = {
  ticketRadius: number
  bannerRadius: number
  inset: number
  dotSize: number
  dotGap: number
  wordmark: string
  wordmarkPad: string
  banner: string
  bannerPad: string
  overlap: string
}

const SPECS: Record<Size, Spec> = {
  xs: {
    ticketRadius: 12,
    bannerRadius: 14,
    inset: 5,
    dotSize: 1.6,
    dotGap: 4.5,
    wordmark: "text-[15px]",
    wordmarkPad: "px-3 py-1",
    banner: "text-[9px]",
    bannerPad: "px-3 py-1.5",
    overlap: "-mt-2",
  },
  sm: {
    ticketRadius: 18,
    bannerRadius: 18,
    inset: 6,
    dotSize: 2,
    dotGap: 6,
    wordmark: "text-2xl",
    wordmarkPad: "px-5 py-1.5",
    banner: "text-[11px]",
    bannerPad: "px-4 py-2",
    overlap: "-mt-2.5",
  },
  md: {
    ticketRadius: 28,
    bannerRadius: 24,
    inset: 9,
    dotSize: 2.6,
    dotGap: 8,
    wordmark: "text-4xl sm:text-5xl",
    wordmarkPad: "px-8 py-3",
    banner: "text-base",
    bannerPad: "px-5 py-2",
    overlap: "-mt-4",
  },
  lg: {
    ticketRadius: 36,
    bannerRadius: 30,
    inset: 11,
    dotSize: 3.2,
    dotGap: 10,
    wordmark: "text-6xl sm:text-7xl",
    wordmarkPad: "px-12 py-4",
    banner: "text-lg",
    bannerPad: "px-7 py-2.5",
    overlap: "-mt-5",
  },
}

function DottedFrame({
  spec,
  radius,
  color,
  children,
  className,
}: {
  spec: Spec
  radius: number
  color: string
  children: React.ReactNode
  className?: string
}) {
  const innerRadius = Math.max(2, radius - spec.inset)
  return (
    <div
      className={cn("relative", className)}
      style={{ background: color, borderRadius: radius }}
    >
      <svg
        className="pointer-events-none absolute"
        aria-hidden
        style={{
          top: spec.inset,
          insetInlineStart: spec.inset,
          width: `calc(100% - ${spec.inset * 2}px)`,
          height: `calc(100% - ${spec.inset * 2}px)`,
        }}
      >
        <rect
          x={spec.dotSize / 2}
          y={spec.dotSize / 2}
          width={`calc(100% - ${spec.dotSize}px)`}
          height={`calc(100% - ${spec.dotSize}px)`}
          rx={innerRadius}
          ry={innerRadius}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={spec.dotSize}
          strokeDasharray={`0 ${spec.dotGap}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * BowlingLogo — stamped signboard. Red ticket field with a dotted white
 * inner ring (drawn via SVG strokeDasharray + linecap=round so the dots
 * stay perfectly circular at any size), teal banner overlapping the
 * bottom edge with the same treatment, both tilted -3deg.
 */
export function BowlingLogo({
  city,
  size = "md",
  className,
}: {
  city: string
  size?: Size
  className?: string
}) {
  const spec = SPECS[size]
  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      role="img"
      aria-label={`Bowling ${city}`}
    >
      <DottedFrame
        spec={spec}
        radius={spec.ticketRadius}
        color="var(--red)"
        className="-rotate-3"
      >
        <span
          className={cn(
            "block font-display leading-none tracking-tight text-white",
            spec.wordmarkPad,
            spec.wordmark
          )}
        >
          BOWLING
        </span>
      </DottedFrame>
      <DottedFrame
        spec={spec}
        radius={spec.bannerRadius}
        color="var(--turq)"
        className={cn(spec.overlap, "-rotate-3")}
      >
        <span
          className={cn(
            "block font-bold tracking-wide whitespace-nowrap text-white",
            spec.bannerPad,
            spec.banner
          )}
        >
          {city}
        </span>
      </DottedFrame>
    </div>
  )
}
