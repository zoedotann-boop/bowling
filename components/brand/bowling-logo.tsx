import { cn } from "@/lib/utils"

type Size = "xs" | "sm" | "md" | "lg"

const wordmarkSize: Record<Size, string> = {
  xs: "text-base",
  sm: "text-xl sm:text-2xl",
  md: "text-3xl sm:text-4xl",
  lg: "text-5xl sm:text-6xl",
}

const wordmarkPad: Record<Size, string> = {
  xs: "px-2.5 py-1",
  sm: "px-3.5 py-1.5",
  md: "px-5 py-2",
  lg: "px-8 py-3",
}

const bannerSize: Record<Size, string> = {
  xs: "text-[9px] px-1.5 py-0.5",
  sm: "text-[11px] px-2 py-0.5",
  md: "text-[13px] px-3 py-1",
  lg: "text-[15px] px-4 py-1",
}

const ticketPad: Record<Size, string> = {
  xs: "p-1",
  sm: "p-1.5",
  md: "p-1.5",
  lg: "p-2",
}

/**
 * BowlingLogo — the stamped signboard logo, reconstructed in-line so it
 * scales cleanly across sizes. Red ticket field (-3deg) with a dashed
 * cream inner ring and the BOWLING wordmark in the display font; teal
 * banner below (-3deg) with a matching inner ring holding the city name.
 * The wordmark stays Latin; only the city banner switches script.
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
  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      role="img"
      aria-label={`Bowling ${city}`}
    >
      <div className={cn("-rotate-3 rounded-xl bg-red", ticketPad[size])}>
        <div
          className={cn(
            "rounded-lg border-2 border-dashed border-white/90",
            wordmarkPad[size]
          )}
        >
          <span
            className={cn(
              "block font-display leading-none tracking-tight text-white",
              wordmarkSize[size]
            )}
          >
            BOWLING
          </span>
        </div>
      </div>
      <div
        className={cn(
          "-mt-1.5 -rotate-3 rounded-md bg-turq p-0.5",
          size === "xs" ? "-mt-1" : ""
        )}
      >
        <div
          className={cn(
            "rounded-sm border-2 border-dashed border-white/90 font-bold tracking-wide text-white",
            bannerSize[size]
          )}
        >
          {city}
        </div>
      </div>
    </div>
  )
}
