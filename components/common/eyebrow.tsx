import { cn } from "@/lib/utils"

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-medium tracking-[0.18em] text-ink-muted uppercase",
        className
      )}
    >
      {children}
    </span>
  )
}
