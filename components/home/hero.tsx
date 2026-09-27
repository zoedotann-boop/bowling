"use client"

import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useIsOpen } from "@/lib/hours"
import { pickLocale } from "@/lib/localized"
import { useBranch } from "@/components/branch-context"
import { useSiteContent } from "@/components/site-content-context"
import { LaneLines } from "@/components/decor/lane-lines"
import { NeonSign } from "@/components/decor/neon-sign"
import { PinsSettle } from "@/components/decor/pins-settle"
import { Container } from "./container"

export function Hero() {
  const t = useTranslations("hero")
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const isOpen = useIsOpen() ?? true
  const home = useSiteContent()?.home

  const title = pickLocale(home?.heroTitle, locale)
  const subtitle = pickLocale(home?.heroSubtitle, locale)
  const ctaLabel = pickLocale(home?.heroCtaLabel, locale)

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <LaneLines />

      <Container className="pt-10 pb-[170px] lg:flex lg:min-h-[max(620px,52vw)] lg:flex-col lg:items-center lg:justify-center lg:py-20 lg:text-center">
        <PinsSettle className="mb-4 lg:mb-5" />

        <div className="mb-5 flex justify-center lg:mb-7">
          <NeonSign flicker />
        </div>

        <div className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-[12px] font-semibold text-muted-foreground lg:text-[13px]">
          <span
            className={cn(
              "size-1.5 animate-blink",
              isOpen ? "bg-green" : "bg-secondary"
            )}
          />
          {branch.name[locale]} · {t(isOpen ? "openNow" : "closedNow")}
        </div>

        <h1 className="mt-4 mb-3.5 font-heading text-[42px] leading-[1.03] font-black tracking-[-1.5px] text-navy lg:mt-5 lg:mb-5 lg:text-[64px] lg:leading-[0.98] lg:tracking-[-2px]">
          {title ? (
            title
          ) : (
            <>
              {t("titleBefore")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
              <br className="hidden lg:block" /> {t("titleAfter")}
            </>
          )}
        </h1>

        <p className="mb-[18px] text-base leading-[1.55] font-medium text-mud lg:mx-auto lg:mb-8 lg:max-w-[560px] lg:text-[18px]">
          {subtitle ||
            t(branch.hasGymboree ? "description" : "descriptionNoGymboree")}
        </p>

        <div className="mt-14 flex flex-col gap-2.5 lg:mt-0 lg:flex-row lg:justify-center">
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-[15px] font-heading text-base font-extrabold text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:py-4 lg:text-[17px]"
          >
            <span className="text-[17px]">➤</span>
            {t("waze")}
          </a>
          <a
            href={whatsappUrl(branch.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm border border-navy/30 bg-transparent px-6 py-[15px] font-heading text-base font-extrabold text-foreground transition-colors hover:border-primary hover:text-primary lg:py-4 lg:text-[17px]"
          >
            {ctaLabel || t("whatsapp")}
          </a>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3.5 lg:mt-9 lg:w-full lg:max-w-[460px] lg:text-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[16px] font-black text-foreground">
                {branch.name[locale]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-bold",
                  isOpen ? "text-green" : "text-secondary"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isOpen ? "bg-green" : "bg-secondary"
                  )}
                />
                {t(isOpen ? "open" : "closed")}
              </span>
            </div>
            <div className="mt-1 text-[12.5px] font-medium text-mud">
              {branch.addressFull[locale]}
            </div>
          </div>
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-sm bg-primary px-3.5 py-2.5 font-heading text-[13px] font-extrabold whitespace-nowrap text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            {t("wazeShort")}
          </a>
        </div>
      </Container>
    </section>
  )
}
