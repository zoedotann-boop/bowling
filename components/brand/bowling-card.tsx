import { cn } from "@/lib/utils"

type Surface = "paper" | "cream" | "red" | "turq" | "yellow" | "ink"
type Ring = "red" | "turq" | "yellow" | "ink" | "none"
type Shadow = "sm" | "md" | "lg" | "none"

const surfaceClass: Record<Surface, string> = {
  paper: "bg-paper text-ink",
  cream: "bg-cream text-ink",
  red: "bg-red text-white",
  turq: "bg-turq text-white",
  yellow: "bg-yellow text-ink",
  ink: "bg-ink text-cream",
}

const ringClass: Record<Ring, string> = {
  red: "border-red",
  turq: "border-turq",
  yellow: "border-yellow-2",
  ink: "border-ink",
  none: "",
}

const shadowClass: Record<Shadow, string> = {
  sm: "shadow-block-sm",
  md: "shadow-block",
  lg: "shadow-block-lg",
  none: "",
}

/**
 * BowlingCard — the signature surface. Solid plate, 2–3px ink border,
 * hard-offset block shadow, optional dashed inner ring that echoes the
 * logo. Used by prices, menu, visit, reviews, and events sections.
 */
export function BowlingCard({
  children,
  surface = "paper",
  ring = "red",
  shadow = "md",
  className,
  contentClassName,
}: {
  children: React.ReactNode
  surface?: Surface
  ring?: Ring
  shadow?: Shadow
  className?: string
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-ink",
        surfaceClass[surface],
        shadowClass[shadow],
        className
      )}
    >
      {ring !== "none" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-2 rounded-lg border-2 border-dashed",
            ringClass[ring]
          )}
        />
      )}
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  )
}
