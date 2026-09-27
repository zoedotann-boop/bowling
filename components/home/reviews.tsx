"use client"

import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { pickLocale } from "@/lib/localized"
import { useSiteContent } from "@/components/site-content-context"
import { Container } from "./container"

const AVATAR_BG = ["bg-pink", "bg-cyan", "bg-marigold"]

// Real Google Maps reviews pulled by the pooler (lib/google/*) and published by
// an admin. The section is hidden until the branch has at least one, so the
// site never shows placeholder testimonials.
export function Reviews() {
  const t = useTranslations("reviews")
  const locale = useLocale() as "he" | "en"
  const home = useSiteContent()
  const reviews = home?.googleReviews ?? []
  if (reviews.length === 0) return null

  const title = pickLocale(home?.home?.reviewsTitle, locale) || t("title")
  const placeId = home?.googlePlaceId

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 lg:mb-8">
        <h2 className="neon-sign-purple font-heading text-[28px] font-black tracking-[-1px] lg:text-[44px]">
          {title}
        </h2>
        {placeId && (
          <a
            href={`https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading text-sm font-extrabold text-cyan underline-offset-4 hover:underline"
          >
            {t("moreOnGoogle")}
          </a>
        )}
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {reviews.map((r, i) => (
          <div
            key={r.id}
            className="hover:glow-cyan rounded-sm border border-navy bg-paper p-5 transition-shadow lg:p-6"
          >
            <div
              className="mb-2.5 text-base tracking-[2px] text-marigold lg:mb-3 lg:text-[17px]"
              aria-label={t("ratingValue", { rating: r.rating })}
            >
              {"★".repeat(r.rating)}
            </div>
            <p
              dir="auto"
              className="mb-3.5 line-clamp-6 text-[15px] leading-[1.55] font-semibold text-foreground lg:mb-4 lg:text-[15.5px] lg:leading-[1.6]"
            >
              {r.text}
            </p>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border border-navy font-heading font-extrabold text-navy-deep lg:size-[38px]",
                  AVATAR_BG[i % AVATAR_BG.length]
                )}
              >
                {r.authorName.charAt(0)}
              </span>
              <span
                dir="auto"
                className="font-heading text-[15px] font-extrabold text-navy"
              >
                {r.authorName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
