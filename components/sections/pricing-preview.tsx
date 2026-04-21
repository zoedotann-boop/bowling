import { getTranslations } from "next-intl/server"
import { IconArrowLeft } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { Link } from "@/i18n/navigation"
import { BowlingCard } from "@/components/brand/bowling-card"
import { Burst } from "@/components/brand/glyphs"
import { Eyebrow } from "@/components/common/eyebrow"

export async function PricingPreview({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("PricingPreview")
  const rows = branch.prices.slice(0, 3)

  return (
    <section
      id="prices"
      className="relative scroll-mt-24 overflow-hidden bg-turq"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -start-8 -top-8 opacity-30"
      >
        <Burst color="#fff" size={200} />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6">
          <Eyebrow tone="cream">{t("title")}</Eyebrow>
          <h2 className="mt-2 font-display text-3xl leading-[1] text-white sm:text-4xl">
            {t("subtitle")}
          </h2>
        </div>

        <BowlingCard
          surface="cream"
          ring="red"
          shadow="lg"
          contentClassName="px-4 py-3 sm:px-5"
        >
          {rows.map((row, i) => (
            <div
              key={i}
              className={`flex items-baseline gap-3 py-2.5 ${
                i < rows.length - 1
                  ? "border-b border-dashed border-ink/30"
                  : ""
              }`}
            >
              <span className="text-base font-extrabold text-ink">
                {row.label}
              </span>
              <span className="flex-1 border-b border-dotted border-ink/40" />
              <span className="font-mono text-xs text-ink/70 tabular-nums">
                {row.weekday}
              </span>
              <span className="font-display text-lg text-red">
                {row.weekend}
              </span>
            </div>
          ))}
        </BowlingCard>

        <div className="mt-5 flex justify-center">
          <Link
            href="/prices"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.18em] text-white uppercase transition-all hover:gap-3"
          >
            {t("viewAll")}
            <IconArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
