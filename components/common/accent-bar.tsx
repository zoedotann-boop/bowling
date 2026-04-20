import { cn } from "@/lib/utils"

const widths = {
  sm: "w-10",
  md: "w-14",
  lg: "w-20",
} as const

export function AccentBar({
  size = "md",
  className,
}: {
  size?: keyof typeof widths
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn("h-px rounded-full bg-brand-accent/70", widths[size], className)}
    />
  )
}
