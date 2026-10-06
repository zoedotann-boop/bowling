"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import { BookingPanel } from "@/components/booking-form"
import { useEventDetail } from "@/hooks/use-event-detail"
import type { Branch } from "@/lib/branches"
import type { SiteEventType } from "@/lib/db/queries/site"
import type { BookingFormField } from "@/lib/events/fields"
import { pickLocale } from "@/lib/localized"
import type { Locale } from "@/lib/locales"
import { isRemoteImage } from "@/lib/utils"

export function WaiverPage({
  branch,
  slug,
  eventTypes,
  defaultFormFields,
}: {
  branch: Branch
  slug: string
  eventTypes: SiteEventType[]
  defaultFormFields: BookingFormField[]
}) {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const { data, booking } = useEventDetail({
    branch,
    slug,
    eventTypes,
    defaultFormFields,
  })
  if (!booking) return null

  return (
    <main className="min-h-svh bg-cream px-3 pt-5 pb-10 sm:px-6 lg:pt-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex flex-col items-center gap-3 text-center lg:mb-6">
          <Image
            src={branch.logo.src}
            alt={t("brand")}
            width={branch.logo.width}
            height={branch.logo.height}
            unoptimized={isRemoteImage(branch.logo.src)}
            priority
            className="h-10 w-auto lg:h-12"
          />
          <div>
            <h1 className="font-heading text-[24px] leading-tight font-black tracking-[-0.5px] text-navy lg:text-[34px]">
              {t("eventDetails.form.title")}
            </h1>
            <p className="mt-1 text-[14px] font-bold text-mud lg:text-[15px]">
              {data.title} · {pickLocale(branch.name, locale)}
            </p>
            {booking.intro ? (
              <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-[1.5] font-semibold text-muted-foreground lg:text-[15px]">
                {booking.intro}
              </p>
            ) : null}
          </div>
        </header>

        <BookingPanel booking={booking} />
      </div>
    </main>
  )
}
