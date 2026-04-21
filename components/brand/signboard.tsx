import { cn } from "@/lib/utils"

type Tone = "red" | "turq" | "yellow" | "ink" | "cream"

const toneBg: Record<Tone, string> = {
  red: "bg-red text-white",
  turq: "bg-turq text-white",
  yellow: "bg-yellow text-ink",
  ink: "bg-ink text-cream",
  cream: "bg-cream text-ink",
}

const toneDots: Record<Tone, string> = {
  red: "border-white/90",
  turq: "border-white/90",
  yellow: "border-ink/80",
  ink: "border-cream/70",
  cream: "border-ink/70",
}

type Rotate = -3 | -2 | 0 | 2 | 3

const rotateClass: Record<Rotate, string> = {
  [-3]: "-rotate-3",
  [-2]: "-rotate-2",
  [0]: "rotate-0",
  [2]: "rotate-2",
  [3]: "rotate-3",
}

/**
 * Signboard — rotated solid block with a dashed inner ring, mirroring the
 * logo's stamped-ticket motif. Used for the logo, hero headline frame,
 * events feature panel, and in-app "nameplates".
 */
export function Signboard({
  children,
  tone = "red",
  rotate = -2,
  className,
  innerClassName,
}: {
  children: React.ReactNode
  tone?: Tone
  rotate?: Rotate
  className?: string
  innerClassName?: string
}) {
  return (
    <div
      className={cn(
        "relative inline-block rounded-xl p-1.5",
        toneBg[tone],
        rotateClass[rotate],
        className
      )}
    >
      <div
        className={cn(
          "rounded-lg border-2 border-dashed px-4 py-2",
          toneDots[tone],
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
