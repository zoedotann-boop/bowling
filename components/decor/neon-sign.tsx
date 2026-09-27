import { cn } from "@/lib/utils"

export function NeonSign({
  text = "BOWLING",
  className,
  flicker = false,
}: {
  text?: string
  className?: string
  flicker?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-cyan px-4 py-1.5 font-heading text-xl font-black tracking-[0.28em] text-navy uppercase lg:text-[30px]",
        flicker && "animate-flicker",
        className
      )}
    >
      <span className="size-1.5 animate-led-flicker bg-red" />
      {text}
      <span
        className="size-1.5 animate-led-flicker bg-cyan"
        style={{ animationDelay: "1200ms" }}
      />
    </span>
  )
}
