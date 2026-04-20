import { getLocale, getTranslations } from "next-intl/server"
import { IconStarFilled, IconBrandGoogle, IconArrowUpRight } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { Eyebrow } from "@/components/common/eyebrow"

export async function GoogleReviews({ branch }: { branch: Branch }) {
  const t = await getTranslations("Reviews")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const { google } = branch

  return (
    <section className="bg-surface-warm">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-3 font-heading text-4xl text-ink sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-lg text-base text-ink-soft sm:text-lg">{t("subtitle")}</p>
          </div>

          <div className="md:col-span-5">
            <div className="flex items-center gap-5 rounded-3xl border border-line bg-surface p-6 shadow-soft">
              <div className="grid size-14 place-items-center rounded-2xl bg-surface-muted">
                <IconBrandGoogle className="size-7 text-ink" aria-hidden />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-4xl text-ink">
                    {google.rating.toFixed(1)}
                  </span>
                  <Stars rating={google.rating} />
                </div>
                <div className="mt-1 text-xs text-ink-muted">
                  {t("reviewsCount", { count: google.count })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 sm:mt-14">
          {google.reviews.map((r, i) => (
            <article
              key={i}
              className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8"
            >
              <div className="flex items-center justify-between gap-3">
                <Stars rating={r.rating} />
                <span className="text-xs text-ink-muted">{r.date[locale]}</span>
              </div>
              <p className="mt-4 text-pretty text-base leading-relaxed text-ink">
                {r.text[locale]}
              </p>
              <p className="mt-5 text-sm font-medium text-ink-soft">- {r.author}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <a
            href={google.profileUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted"
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
    <span className="text-amber-500" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarFilled
          key={i}
          aria-hidden
          className={`inline size-4 ${i < full ? "" : "text-line"}`}
        />
      ))}
    </span>
  )
}
