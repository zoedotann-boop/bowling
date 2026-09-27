"use client"

import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { pickLocale } from "@/lib/localized"
import { useSiteContent } from "@/components/site-content-context"
import { Container } from "./container"

const AVATAR_BG = ["bg-pink", "bg-cyan", "bg-marigold"]

// Cap the mix of curated + Google reviews so the grid stays tidy.
const MAX_REVIEWS = 9

interface ReviewItem {
  name: string
  quote: string
  rating: number
}

export function Reviews() {
  const t = useTranslations("reviews")
  const locale = useLocale() as "he" | "en"
  const home = useSiteContent()
  // Curated reviews first, then the published Google reviews pulled by the
  // pooler; fall back to the next-intl copy only when both are empty.
  const manual: ReviewItem[] = (home?.reviews ?? []).map((r) => ({
    name: pickLocale(r.author, locale),
    quote: pickLocale(r.quote, locale),
    rating: r.rating,
  }))
  const google: ReviewItem[] = (home?.googleReviews ?? []).map((r) => ({
    name: r.authorName,
    quote: r.text,
    rating: r.rating,
  }))
  const merged = [...manual, ...google]
  const items: ReviewItem[] = (
    merged.length
      ? merged
      : (t.raw("items") as { name: string; quote: string }[]).map((r) => ({
          ...r,
          rating: 5,
        }))
  ).slice(0, MAX_REVIEWS)
  const title = pickLocale(home?.home?.reviewsTitle, locale) || t("title")

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4 lg:mb-8">
        <h2 className="neon-sign-purple font-heading text-[28px] font-black tracking-[-1px] lg:text-[44px]">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {items.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="hover:glow-cyan rounded-sm border border-navy bg-paper p-5 transition-shadow lg:p-6"
          >
            <div
              className="mb-2.5 text-base tracking-[2px] text-marigold lg:mb-3 lg:text-[17px]"
              aria-label={t("ratingValue", { rating: r.rating })}
            >
              {"★".repeat(r.rating)}
            </div>
            <p className="mb-3.5 text-[15px] leading-[1.55] font-semibold text-foreground lg:mb-4 lg:text-[15.5px] lg:leading-[1.6]">
              {r.quote}
            </p>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border border-navy font-heading font-extrabold text-navy-deep lg:size-[38px]",
                  AVATAR_BG[i % AVATAR_BG.length]
                )}
              >
                {r.name.charAt(0)}
              </span>
              <span className="font-heading text-[15px] font-extrabold text-navy">
                {r.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
