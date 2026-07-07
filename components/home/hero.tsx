"use client"

import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "./container"

export function Hero() {
  const t = useTranslations("hero")
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"

  return (
    <section className="relative isolate overflow-hidden">
      {/* Backgrounds — portrait art on mobile, landscape art on desktop */}
      <div className="absolute inset-0 -z-10 lg:hidden">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>
      <div className="absolute inset-0 -z-10 hidden bg-[#fdf3e0] lg:block">
        <Image
          src="/hero-desktop-wide.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <Container className="pt-7 pb-[190px] lg:flex lg:min-h-[max(600px,53.3vw)] lg:flex-col lg:items-center lg:justify-center lg:py-16 lg:text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-navy bg-marigold px-3.5 py-1.5 text-[13px] font-extrabold text-navy lg:text-sm">
          <span className="size-2 animate-blink rounded-full bg-navy" />
          {branch.name[locale]} · {t("openNow")}
        </div>

        <h1 className="mt-4 mb-3.5 font-heading text-[44px] leading-[1.02] font-black tracking-[-1.5px] text-navy lg:mt-5 lg:mb-5 lg:text-[68px] lg:leading-[0.98] lg:tracking-[-2px]">
          {t("titleBefore")}{" "}
          <span className="inline-block rounded-md border-[3px] border-dotted border-navy bg-rust px-2.5 text-paper">
            {t("titleHighlight")}
          </span>
          <br className="hidden lg:block" /> {t("titleAfter")}
        </h1>

        <p className="mb-[18px] text-base leading-[1.55] font-semibold text-mud lg:mx-auto lg:mb-7 lg:max-w-[600px] lg:text-[19px]">
          {t("description")}
        </p>

        <div className="mt-16 flex flex-col gap-2.5 lg:mt-0 lg:flex-row lg:justify-center">
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-navy bg-navy px-5 py-[15px] font-heading text-base font-extrabold text-paper transition-colors hover:bg-cyan hover:text-navy lg:px-6 lg:py-4 lg:text-[17px]"
          >
            <span className="text-[17px]">➤</span>
            {t("waze")}
          </a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-[3px] border-navy bg-paper px-5 py-[15px] font-heading text-base font-extrabold text-navy transition-colors hover:bg-marigold lg:px-6 lg:py-4 lg:text-[17px]"
          >
            {t("whatsapp")}
          </a>
        </div>

        {/* Branch card */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border-[4px] border-navy bg-paper px-4 py-3.5 lg:mt-8 lg:w-full lg:max-w-[460px] lg:text-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-[17px] font-black text-navy">
                {branch.name[locale]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-navy bg-teal px-2.5 py-0.5 text-[11px] font-extrabold text-cream-warm">
                <span className="size-1.5 rounded-full bg-mint" />
                {t("open")}
              </span>
            </div>
            <div className="mt-1 text-[12.5px] font-semibold text-mud">
              {branch.addressFull[locale]}
            </div>
          </div>
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl border-[3px] border-navy bg-rust px-3.5 py-2.5 font-heading text-[13px] font-extrabold whitespace-nowrap text-paper transition-colors hover:bg-navy"
          >
            {t("wazeShort")}
          </a>
        </div>
      </Container>
    </section>
  )
}
