import { useTranslations } from "next-intl"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Container } from "./container"

function SoldierDiscount({ className }: { className?: string }) {
  const t = useTranslations("pricing")
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border-[3px] border-navy bg-pink px-3.5 py-2.5",
        className
      )}
    >
      <div>
        <div className="font-heading text-sm font-extrabold text-navy">
          {t("soldierTitle")}
        </div>
        <div className="text-[11.5px] font-semibold text-teal">
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
          <span className="font-mono text-[13px] font-bold text-orange lg:text-sm">
            {t("eyebrow")}
          </span>
          <h2 className="mt-1.5 mb-3 font-heading text-[38px] leading-none font-black tracking-[-1px] text-navy lg:mb-4 lg:text-[52px]">
            {t("title")}
          </h2>
          <p className="mb-4 text-[15px] leading-[1.55] font-semibold text-mud lg:mb-5 lg:max-w-[380px] lg:text-base">
            {t("description")}
          </p>
          <SoldierDiscount className="hidden lg:inline-flex" />
        </div>

        {/* Price table */}
        <div className="overflow-hidden rounded-[20px] border-[4px] border-navy bg-paper lg:rounded-[22px]">
          <div className={cn(priceRow, "border-b-[4px] border-navy bg-paper")}>
            <div className={cn(priceLabel, "text-navy")}>{t("weekdays")}</div>
            <div className={cn(priceValue, "text-navy")}>
              {t("weekdaysPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "border-b-[4px] border-navy bg-cream")}>
            <div className={cn(priceLabel, "text-navy")}>{t("weekend")}</div>
            <div className={cn(priceValue, "text-navy")}>
              {t("weekendPrice")}
            </div>
          </div>
          <div className={cn(priceRow, "bg-gold")}>
            <div>
              <div className={cn(priceLabel, "text-paper")}>
                {t("thirdGame")}
              </div>
              <div className="text-xs font-bold text-[#ffd0cc]">
                {t("thirdGameNote")}
              </div>
            </div>
            <div className={cn(priceValue, "text-cream-warm")}>
              {t("thirdGamePrice")}
            </div>
          </div>
        </div>
      </div>

      {/* Soldier discount (mobile placement) */}
      <SoldierDiscount className="mt-4 lg:hidden" />

      {/* Birthday CTA */}
      <div className="mt-5 overflow-hidden rounded-[24px] border-[5px] border-navy bg-rust lg:mt-12 lg:rounded-[28px] lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="p-[26px] lg:p-11">
          <span className="font-mono text-[13px] font-bold text-[#ffd0cc] lg:text-sm">
            {t("birthdayEyebrow")}
          </span>
          <h3 className="mt-2 mb-3 font-heading text-[32px] leading-[1.02] font-black tracking-[-1px] text-paper lg:mb-3.5 lg:text-[44px]">
            {t("birthdayTitle")}
          </h3>
          <p className="mb-5 text-[15px] leading-[1.55] font-semibold text-[#ffe3e0] lg:mb-6 lg:max-w-[440px] lg:text-[17px]">
            {t("birthdayDescription")}
          </p>
          <Link
            href="/events"
            className="inline-block w-full rounded-full border-[3px] border-navy bg-paper px-5 py-3.5 text-center font-heading text-[15px] font-extrabold text-navy transition-colors hover:bg-marigold lg:w-auto lg:px-7 lg:py-4 lg:text-base"
          >
            {t("birthdayCta")}
          </Link>
        </div>
        <div className="relative min-h-[220px] border-t-[5px] border-navy lg:min-h-full lg:border-t-0 lg:border-s-[5px] rtl:lg:border-e-[5px] rtl:lg:border-s-0">
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
