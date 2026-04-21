import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/common/eyebrow"

/**
 * SectionHeader — the standard rhythm for every section: mono eyebrow,
 * chunky display title, optional subtitle. Accepts React nodes in `title`
 * so consumers can highlight a closing word with `<span className="text-red">`.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  eyebrowTone = "red",
  titleClassName,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "center" | "start"
  eyebrowTone?: "red" | "ink" | "cream" | "yellow"
  titleClassName?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className
      )}
    >
      {eyebrow && <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-3 font-display text-3xl leading-[0.95] text-ink sm:text-4xl md:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-ink-soft sm:text-lg">{subtitle}</p>
      )}
    </div>
  )
}
