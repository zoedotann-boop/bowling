import { cn } from "@/lib/utils"

import { PIN_PATH, PIN_VIEWBOX } from "./bowling-pin"

// The one playful bowling moment: a small rack of pins drops and settles into
// place once on load (staggered), then rests. FLAT — off-white pins with a red
// stripe (logo red), no shadow/glow. Reduced-motion shows them settled instantly.
const TILTS = [-6, 4, -5, 6, -4]

export function PinsSettle({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-end justify-center gap-2 select-none",
        className
      )}
    >
      {TILTS.map((tilt, i) => (
        <svg
          key={i}
          viewBox={PIN_VIEWBOX}
          className="w-3.5 animate-pin-settle lg:w-4"
          style={
            {
              "--pin-tilt": `${tilt}deg`,
              animationDelay: `${i * 90}ms`,
            } as React.CSSProperties
          }
        >
          <clipPath id="pins-settle-clip">
            <path d={PIN_PATH} />
          </clipPath>
          <path d={PIN_PATH} fill="#fefcfa" />
          <g clipPath="url(#pins-settle-clip)">
            <rect x="0" y="40" width="60" height="7" fill="#e2212a" />
          </g>
        </svg>
      ))}
    </div>
  )
}
