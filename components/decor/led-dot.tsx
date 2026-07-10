import { cn } from "@/lib/utils"

// A small filled LED dot that flickers like the venue's lights. Flat (no glow).
export function LedDot({
  className,
  color = "primary",
  delay = 0,
}: {
  className?: string
  color?: "primary" | "secondary"
  delay?: number
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-1.5 shrink-0 animate-led-flicker",
        color === "secondary" ? "bg-secondary" : "bg-primary",
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    />
  )
}
