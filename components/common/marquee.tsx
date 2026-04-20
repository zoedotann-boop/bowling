import { cn } from "@/lib/utils"

export function Marquee({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  const track = [...items, ...items]
  return (
    <div
      className={cn(
        "marquee-host relative overflow-hidden border-y-2 border-ink bg-brand-accent text-paper",
        className,
      )}
      aria-hidden
    >
      <div className="marquee-track gap-8 py-3 text-sm font-bold uppercase tracking-[0.18em]">
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span>{item}</span>
            <span aria-hidden>★</span>
          </span>
        ))}
      </div>
    </div>
  )
}
