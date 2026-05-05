import { getTranslations } from "next-intl/server"
import type { SiteBranch } from "@/lib/site-branch"
import { Eyebrow } from "@/components/common/eyebrow"

export async function PricingPreview({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("PricingPreview")
  const rows = branch.prices

  if (rows.length === 0) return null

  return (
    <section id="prices" className="scroll-mt-24 bg-cream-2">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="red">{t("title")}</Eyebrow>
        <h2 className="mt-2 font-display text-2xl leading-[1.05] text-ink sm:text-3xl">
          {t("subtitle")}
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          {t("weekday")} · {t("weekend")}
        </p>

        <div className="mt-6 border-2 border-ink bg-paper shadow-block-sm">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-baseline gap-3 px-4 py-3 ${
                i < rows.length - 1
                  ? "border-b-2 border-dashed border-ink/15"
                  : ""
              }`}
            >
              <span className="text-sm font-extrabold text-ink">
                {row.label}
              </span>
              <span className="flex-1" />
              <span className="font-mono text-xs text-ink/60 tabular-nums">
                {row.weekday}
              </span>
              <span className="font-display text-base text-ink tabular-nums">
                {row.weekend}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
