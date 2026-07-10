import { cn } from "@/lib/utils"

// Single source-of-truth silhouette for the venue's cream + red-stripe bowling
// pin. Transparent background so it tiles/overlays cleanly on the dark theme.
// (The raw public/pin.png has an opaque light background and can't be tiled.)
export const PIN_VIEWBOX = "0 0 60 156"
export const PIN_PATH =
  "M30 3c6 0 11 5 11 11 0 6-3 10-5 15-2 5-2 9-1 14 2 11 13 21 14 41 1 15-3 27-7 39-2 6-3 12-2 17H21c1-5 0-11-2-17-4-12-8-24-7-39 1-20 12-30 14-41 1-5 1-9-1-14-2-5-5-9-5-15 0-6 5-11 11-11Z"

// A standalone pin, e.g. a small inline bullet before eyebrow labels.
export function BowlingPin({ className }: { className?: string }) {
  return (
    <svg
      viewBox={PIN_VIEWBOX}
      className={cn("block", className)}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id="bp-solo-clip">
        <path d={PIN_PATH} />
      </clipPath>
      <path d={PIN_PATH} fill="#efe7d9" stroke="#cdbfa6" strokeWidth="1.4" />
      <g clipPath="url(#bp-solo-clip)">
        <rect x="0" y="41" width="60" height="7" fill="#d8452e" />
        <rect x="0" y="52" width="60" height="7" fill="#d8452e" />
      </g>
    </svg>
  )
}
