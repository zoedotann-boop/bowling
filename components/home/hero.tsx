"use client"

import { useLocale, useTranslations } from "next-intl"

import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { NeonSign } from "@/components/decor/neon-sign"
import { PinsSettle } from "@/components/decor/pins-settle"
import { Container } from "./container"

export function Hero() {
  const t = useTranslations("hero")
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"

  return (
    <section className="relative isolate overflow-hidden bg-background">
      {/* Flat concrete lane in perspective — LED lines converging, no gradient. */}
      <div className="absolute inset-0 -z-20 flex justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 1000"
          preserveAspectRatio="xMidYMin slice"
          className="h-full w-full max-w-[1100px] opacity-[0.22]"
          aria-hidden="true"
        >
          <g fill="none" strokeLinecap="round" strokeWidth="2">
            <line x1="400" y1="120" x2="40" y2="1000" stroke="#02b2cd" />
            <line x1="400" y1="120" x2="760" y2="1000" stroke="#02b2cd" />
            <line x1="400" y1="120" x2="230" y2="1000" stroke="#02b2cd" />
            <line x1="400" y1="120" x2="570" y2="1000" stroke="#02b2cd" />
            <line x1="400" y1="120" x2="400" y2="1000" stroke="#e2212a" />
            {/* lane cross-slats receding */}
            <line x1="330" y1="300" x2="470" y2="300" stroke="#02b2cd" />
            <line x1="285" y1="470" x2="515" y2="470" stroke="#02b2cd" />
            <line x1="235" y1="680" x2="565" y2="680" stroke="#02b2cd" />
          </g>
        </svg>
      </div>

      <Container className="pt-10 pb-[170px] lg:flex lg:min-h-[max(620px,52vw)] lg:flex-col lg:items-center lg:justify-center lg:py-20 lg:text-center">
        {/* One playful moment: a small rack of pins settling in */}
        <PinsSettle className="mb-4 lg:mb-5" />

        {/* The one identity element: the flat "BOWLING" LED sign */}
        <div className="mb-5 flex justify-center lg:mb-7">
          <NeonSign flicker />
        </div>

        {/* Open-now status — quiet, one cyan dot */}
        <div className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1 text-[12px] font-semibold text-muted-foreground lg:text-[13px]">
          <span className="size-1.5 animate-blink bg-primary" />
          {branch.name[locale]} · {t("openNow")}
        </div>

        <h1 className="mt-4 mb-3.5 font-heading text-[42px] leading-[1.03] font-black tracking-[-1.5px] text-navy lg:mt-5 lg:mb-5 lg:text-[64px] lg:leading-[0.98] lg:tracking-[-2px]">
          {t("titleBefore")}{" "}
          <span className="text-primary">{t("titleHighlight")}</span>
          <br className="hidden lg:block" /> {t("titleAfter")}
        </h1>

        <p className="mb-[18px] text-base leading-[1.55] font-medium text-mud lg:mx-auto lg:mb-8 lg:max-w-[560px] lg:text-[18px]">
          {t("description")}
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
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-sm border border-navy/30 bg-transparent px-6 py-[15px] font-heading text-base font-extrabold text-foreground transition-colors hover:border-primary hover:text-primary lg:py-4 lg:text-[17px]"
          >
            {t("whatsapp")}
          </a>
        </div>

        {/* Branch card */}
        <div className="mt-6 flex items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3.5 lg:mt-9 lg:w-full lg:max-w-[460px] lg:text-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[16px] font-black text-foreground">
                {branch.name[locale]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                {t("open")}
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
