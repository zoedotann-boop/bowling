import Link from "next/link"
import { useTranslations } from "next-intl"

import { Container } from "@/components/home/container"
import { LaneLines } from "@/components/decor/lane-lines"
import { PinsSettle } from "@/components/decor/pins-settle"

// A flat bowling ball standing in for the "0" of 404 — three finger holes
// punched through in the page background color.
function BowlingBall() {
  return (
    <svg viewBox="0 0 100 100" className="size-[0.74em]" aria-hidden="true">
      <circle cx="50" cy="50" r="48" className="fill-primary" />
      <circle cx="38" cy="30" r="6" className="fill-cream" />
      <circle cx="56" cy="26" r="6" className="fill-cream" />
      <circle cx="50" cy="46" r="7" className="fill-cream" />
    </svg>
  )
}

// Themed public 404 body (used by app/not-found.tsx and app/(site)/not-found.tsx):
// the rack is still standing because the ball went in the gutter.
export function NotFoundPage() {
  const t = useTranslations("notFoundPage")

  return (
    <section className="relative isolate overflow-hidden">
      <LaneLines />

      <Container className="flex flex-col items-center py-16 text-center lg:py-24">
        <PinsSettle className="mb-5" />

        <div
          dir="ltr"
          aria-hidden="true"
          className="flex items-center gap-[0.06em] font-heading text-[112px] leading-none font-black tracking-[-4px] text-navy lg:text-[168px]"
        >
          4<BowlingBall />4
        </div>

        <h1 className="mt-6 font-heading text-[36px] leading-none font-black tracking-[-1.5px] text-navy lg:text-[52px]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[480px] text-base leading-[1.6] font-medium text-mud lg:text-[18px]">
          {t("text")}
        </p>

        <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-[15px] font-heading text-base font-extrabold text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:py-4 lg:text-[17px]"
          >
            {t("home")}
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-sm border border-navy/30 px-6 py-[15px] font-heading text-base font-extrabold text-foreground transition-colors hover:border-primary hover:text-primary lg:py-4 lg:text-[17px]"
          >
            {t("events")}
          </Link>
        </div>
      </Container>
    </section>
  )
}
