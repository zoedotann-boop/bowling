"use client"

import { useLocale, useTranslations } from "next-intl"

import Link from "next/link"

import { cn } from "@/lib/utils"
import type { Localized } from "@/lib/db/schema/_shared"
import { pickLocale } from "@/lib/localized"
import { LedDot } from "@/components/decor/led-dot"
import { BirthdayScene } from "@/components/illustrations"
import { useSiteContent } from "@/components/site-content-context"
import { Container } from "./container"

function SoldierDiscount({
  title,
  note,
  className,
}: {
  title: string
  note: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "glow-primary inline-flex items-center gap-2 rounded-sm border border-primary bg-card px-3.5 py-2.5",
        className
      )}
    >
      <div>
        <div className="font-heading text-sm font-extrabold text-primary">
          {title}
        </div>
        <div className="text-[11.5px] font-semibold text-secondary">{note}</div>
      </div>
    </div>
  )
}

const priceRow = "flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5"
const priceLabel = "font-heading text-[17px] font-extrabold lg:text-[19px]"
const priceValue = "font-heading text-[26px] font-black lg:text-[30px]"

export function Pricing() {
  const t = useTranslations("pricing")
  const locale = useLocale() as "he" | "en"
  const pricing = useSiteContent()?.pricing

  const val = (value: Localized | null | undefined, key: string) =>
    pickLocale(value, locale) || t(key)

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
        <div>
          <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
            <LedDot color="secondary" className="me-2 align-middle" />
            {val(pricing?.eyebrow, "eyebrow")}
          </span>
          <h2 className="neon-sign-purple mt-1.5 mb-3 font-heading text-[38px] leading-none font-black tracking-[-1px] lg:mb-4 lg:text-[52px]">
            {val(pricing?.title, "title")}
          </h2>
          <p className="mb-4 text-[15px] leading-[1.55] font-semibold text-mud lg:mb-5 lg:max-w-[380px] lg:text-base">
            {val(pricing?.description, "description")}
          </p>
          <SoldierDiscount
            title={val(pricing?.soldierTitle, "soldierTitle")}
            note={val(pricing?.soldierNote, "soldierNote")}
            className="hidden lg:inline-flex"
          />
        </div>

        <div className="hover:glow-cyan overflow-hidden rounded-sm border border-navy bg-paper transition-shadow lg:rounded-sm">
          <div className={cn(priceRow, "border-b border-border bg-card")}>
            <div className={cn(priceLabel, "text-navy")}>
              {val(pricing?.weekdaysLabel, "weekdays")}
            </div>
            <div className={cn(priceValue, "text-navy")}>
              {val(pricing?.weekdaysPrice, "weekdaysPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "border-b border-border bg-cream-warm")}>
            <div className={cn(priceLabel, "text-navy")}>
              {val(pricing?.weekendLabel, "weekend")}
            </div>
            <div className={cn(priceValue, "text-navy")}>
              {val(pricing?.weekendPrice, "weekendPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "glow-primary bg-primary")}>
            <div>
              <div className={cn(priceLabel, "text-primary-foreground")}>
                {val(pricing?.thirdGameLabel, "thirdGame")}
              </div>
              <div className="text-xs font-bold text-navy-deep">
                {val(pricing?.thirdGameNote, "thirdGameNote")}
              </div>
            </div>
            <div className={cn(priceValue, "text-primary-foreground")}>
              {val(pricing?.thirdGamePrice, "thirdGamePrice")}
            </div>
          </div>
        </div>
      </div>

      <SoldierDiscount
        title={val(pricing?.soldierTitle, "soldierTitle")}
        note={val(pricing?.soldierNote, "soldierNote")}
        className="mt-4 lg:hidden"
      />

      <div className="neon-frame-magenta mt-5 overflow-hidden rounded-sm bg-card lg:mt-12 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="p-[26px] lg:p-11">
          <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
            <LedDot color="secondary" className="me-2 align-middle" />
            {val(pricing?.birthdayEyebrow, "birthdayEyebrow")}
          </span>
          <h3 className="text-glow-primary mt-2 mb-3 font-heading text-[32px] leading-[1.02] font-black tracking-[-1px] text-foreground lg:mb-3.5 lg:text-[44px]">
            {val(pricing?.birthdayTitle, "birthdayTitle")}
          </h3>
          <p className="mb-5 text-[15px] leading-[1.55] font-semibold text-muted-foreground lg:mb-6 lg:max-w-[440px] lg:text-[17px]">
            {val(pricing?.birthdayDescription, "birthdayDescription")}
          </p>
          <Link
            href="/events"
            className="glow-primary hover:glow-cyan inline-block w-full rounded-sm border border-primary bg-primary px-5 py-3.5 text-center font-heading text-[15px] font-extrabold text-primary-foreground transition-colors hover:border-secondary hover:bg-secondary hover:text-secondary-foreground lg:w-auto lg:px-7 lg:py-4 lg:text-base"
          >
            {val(pricing?.birthdayCtaLabel, "birthdayCta")}
          </Link>
        </div>
        <div className="relative min-h-[220px] border-t-2 border-primary bg-navy-deep lg:min-h-full lg:border-s-2 lg:border-t-0 rtl:lg:border-s-0 rtl:lg:border-e-2">
          <BirthdayScene className="absolute inset-0 h-full w-full p-6" />
        </div>
      </div>
    </Container>
  )
}
