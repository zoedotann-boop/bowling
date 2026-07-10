import { useTranslations } from "next-intl"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

function SoldierDiscount({ className }: { className?: string }) {
  const t = useTranslations("pricing")
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-primary bg-card px-3.5 py-2.5 glow-primary",
        className
      )}
    >
      <div>
        <div className="font-heading text-sm font-extrabold text-primary">
          {t("soldierTitle")}
        </div>
        <div className="text-[11.5px] font-semibold text-secondary">
          {t("soldierNote")}
        </div>
      </div>
    </div>
  )
}

const priceRow = "flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5"
const priceLabel = "font-heading text-[17px] font-extrabold lg:text-[19px]"
const priceValue = "font-heading text-[26px] font-black lg:text-[30px]"

export function Pricing() {
  const t = useTranslations("pricing")

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-10">
        {/* Intro */}
        <div>
          <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm"><LedDot color="secondary" className="me-2 align-middle" />
            {t("eyebrow")}
          </span>
          <h2 className="mt-1.5 mb-3 font-heading text-[38px] leading-none font-black tracking-[-1px] neon-sign-purple lg:mb-4 lg:text-[52px]">
            {t("title")}
          </h2>
          <p className="mb-4 text-[15px] leading-[1.55] font-semibold text-mud lg:mb-5 lg:max-w-[380px] lg:text-base">
            {t("description")}
          </p>
          <SoldierDiscount className="hidden lg:inline-flex" />
        </div>

        {/* Price table */}
        <div className="overflow-hidden rounded-sm border border-navy bg-paper transition-shadow hover:glow-cyan lg:rounded-sm">
          <div className={cn(priceRow, "border-b border-border bg-card")}>
            <div className={cn(priceLabel, "text-navy")}>{t("weekdays")}</div>
            <div className={cn(priceValue, "text-navy")}>
              {t("weekdaysPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "border-b border-border bg-cream-warm")}>
            <div className={cn(priceLabel, "text-navy")}>{t("weekend")}</div>
            <div className={cn(priceValue, "text-navy")}>
              {t("weekendPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "bg-primary glow-primary")}>
            <div>
              <div className={cn(priceLabel, "text-primary-foreground")}>
                {t("thirdGame")}
              </div>
              <div className="text-xs font-bold text-navy-deep">
                {t("thirdGameNote")}
              </div>
            </div>
            <div className={cn(priceValue, "text-primary-foreground")}>
              {t("thirdGamePrice")}
            </div>
          </div>
        </div>
      </div>

      {/* Soldier discount (mobile placement) */}
      <SoldierDiscount className="mt-4 lg:hidden" />

      {/* Birthday CTA */}
      <div className="neon-frame-magenta mt-5 overflow-hidden rounded-sm bg-card lg:mt-12 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="p-[26px] lg:p-11">
          <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm"><LedDot color="secondary" className="me-2 align-middle" />
            {t("birthdayEyebrow")}
          </span>
          <h3 className="mt-2 mb-3 font-heading text-[32px] leading-[1.02] font-black tracking-[-1px] text-foreground text-glow-primary lg:mb-3.5 lg:text-[44px]">
            {t("birthdayTitle")}
          </h3>
          <p className="mb-5 text-[15px] leading-[1.55] font-semibold text-muted-foreground lg:mb-6 lg:max-w-[440px] lg:text-[17px]">
            {t("birthdayDescription")}
          </p>
          <Link
            href="/events"
            className="inline-block w-full rounded-sm border border-primary bg-primary px-5 py-3.5 text-center font-heading text-[15px] font-extrabold text-primary-foreground glow-primary transition-colors hover:bg-secondary hover:text-secondary-foreground hover:border-secondary hover:glow-cyan lg:w-auto lg:px-7 lg:py-4 lg:text-base"
          >
            {t("birthdayCta")}
          </Link>
        </div>
        <div className="relative min-h-[220px] border-t-2 border-primary lg:min-h-full lg:border-s-2 lg:border-t-0 rtl:lg:border-s-0 rtl:lg:border-e-2">
          <Image
            src="/birthday.png"
            alt={t("birthdayTitle")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </Container>
  )
}
