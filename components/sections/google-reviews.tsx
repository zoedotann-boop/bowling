import { getTranslations } from "next-intl/server"
import {
  IconStarFilled,
  IconBrandGoogle,
  IconArrowUpRight,
} from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { BowlingCard } from "@/components/brand/bowling-card"
import { Eyebrow } from "@/components/common/eyebrow"

export async function GoogleReviews({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("Reviews")
  const { google } = branch

  if (google.reviews.length === 0) return null

  return (
    <section className="bg-cream-2">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <Eyebrow tone="red">{t("eyebrow")}</Eyebrow>
            <h2 className="mt-2 font-display text-3xl leading-[1] text-ink sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-base text-ink/70">{t("subtitle")}</p>
          </div>

          <div className="md:col-span-5">
            <BowlingCard
              surface="paper"
              ring="yellow"
              shadow="md"
              contentClassName="flex items-center gap-4 px-4 py-4"
            >
              <div className="grid size-12 place-items-center border-2 border-ink bg-yellow">
                <IconBrandGoogle className="size-6 text-ink" aria-hidden />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl text-ink">
                    {google.rating.toFixed(1)}
                  </span>
                  <Stars rating={google.rating} />
                </div>
                <div className="mt-0.5 font-mono text-[11px] tracking-[0.16em] text-ink/60 uppercase">
                  {t("reviewsCount", { count: google.count })}
                </div>
              </div>
            </BowlingCard>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {google.reviews.map((r, i) => (
            <BowlingCard
              key={i}
              surface="paper"
              ring="red"
              shadow="md"
              contentClassName="px-4 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Stars rating={r.rating} />
                <span className="font-mono text-[10px] tracking-[0.14em] text-ink/60 uppercase">
                  {r.date}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">
                {r.text}
              </p>
              <p className="mt-3 font-mono text-xs font-bold tracking-[0.14em] text-red uppercase">
                — {r.author}
              </p>
            </BowlingCard>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={google.profileUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-bold tracking-[0.14em] text-ink uppercase shadow-block-sm transition-transform active:translate-y-[3px] active:[box-shadow:0_1px_0_var(--ink)]"
          >
            <IconBrandGoogle className="size-4" aria-hidden />
            {t("viewAll")}
            <IconArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-yellow-2" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarFilled
          key={i}
          aria-hidden
          className={`inline size-4 ${i < full ? "" : "text-ink/20"}`}
        />
      ))}
    </span>
  )
}
