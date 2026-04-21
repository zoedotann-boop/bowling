import { cn } from "@/lib/utils"

/**
 * Eyebrow — the "— KICKER —" label that sits above every section heading.
 * Renders as mono red text with wide tracking and em-dash bookends.
 */
export function Eyebrow({
  children,
  tone = "red",
  className,
}: {
  children: React.ReactNode
  tone?: "red" | "ink" | "cream" | "yellow"
  className?: string
}) {
  const color =
    tone === "red"
      ? "text-red"
      : tone === "ink"
        ? "text-ink"
        : tone === "cream"
          ? "text-cream"
          : "text-yellow"
  return (
    <span
      className={cn(
        "inline-block font-mono text-[11px] font-bold tracking-[0.2em] uppercase",
        color,
        className
      )}
    >
      — {children} —
    </span>
  )
}
