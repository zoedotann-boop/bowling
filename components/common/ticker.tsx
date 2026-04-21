import { cn } from "@/lib/utils"

/**
 * Ticker — yellow marquee strip with ink top/bottom borders, used as a
 * section divider under the SiteTopbar. Triplicates items for seamless
 * wrap. Freezes under prefers-reduced-motion via globals.css.
 */
export function Ticker({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  const track = [...items, ...items, ...items]
  return (
    <div
      dir="ltr"
      className={cn(
        "overflow-hidden border-t-2 border-b-2 border-ink bg-yellow",
        className
      )}
    >
      <div
        aria-hidden
        className="flex animate-ticker gap-7 py-1.5 font-mono text-xs font-bold tracking-wider whitespace-nowrap text-ink"
      >
        {track.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
