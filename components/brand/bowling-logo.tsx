import { cn } from "@/lib/utils"

type Size = "xs" | "sm" | "md" | "lg"

const wordmarkSize: Record<Size, string> = {
  xs: "text-sm",
  sm: "text-lg sm:text-xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-4xl sm:text-5xl",
}

const wordmarkPad: Record<Size, string> = {
  xs: "px-2 py-0.5",
  sm: "px-3 py-1",
  md: "px-4 py-1.5",
  lg: "px-6 py-2",
}

const bannerSize: Record<Size, string> = {
  xs: "text-[8px] px-1.5 py-0",
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
}

const ticketPad: Record<Size, string> = {
  xs: "p-1",
  sm: "p-1.5",
  md: "p-1.5",
  lg: "p-1.5",
}

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
      className={cn("inline-flex flex-col items-center", className)}
      role="img"
      aria-label={`Bowling ${city}`}
    >
      <div
        className={cn(
          "rotate-[-2deg] rounded-2xl bg-ticket-red",
          ticketPad[size]
        )}
      >
        <div
          className={cn(
            "rounded-xl border-2 border-dashed border-paper",
            wordmarkPad[size]
          )}
        >
          <span
            className={cn(
              "block font-display leading-none tracking-tight text-paper",
              wordmarkSize[size]
            )}
          >
            BOWLING
          </span>
        </div>
      </div>
      <div className="-mt-1 rotate-[2deg] rounded-md bg-banner-teal p-0.5">
        <div
          className={cn(
            "rounded-sm border border-dashed border-paper",
            bannerSize[size]
          )}
        >
          <span className="block leading-tight font-bold text-paper">
            {city}
          </span>
        </div>
      </div>
    </div>
  )
}
