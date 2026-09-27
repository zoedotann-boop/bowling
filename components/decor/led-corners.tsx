import { LedDot } from "./led-dot"

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
