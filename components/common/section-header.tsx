import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/common/eyebrow"

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-heading text-4xl text-ink sm:text-5xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{subtitle}</p>
      )}
    </div>
  )
}
