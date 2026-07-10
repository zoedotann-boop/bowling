import { LedDot } from "./led-dot"

// Four flickering LED dots at a card's corners — used in place of a full border
// so the card reads as a lit, bracketed panel. Parent must be `relative`.
export function LedCorners() {
  return (
    <>
      <LedDot className="absolute top-1.5 left-1.5" delay={0} />
      <LedDot
        className="absolute top-1.5 right-1.5"
        color="secondary"
        delay={500}
      />
      <LedDot
        className="absolute bottom-1.5 left-1.5"
        color="secondary"
        delay={1000}
      />
      <LedDot className="absolute right-1.5 bottom-1.5" delay={1500} />
    </>
  )
}
