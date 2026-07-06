"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "./container"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const t = useTranslations()
  const navItems = t.raw("header.nav") as string[]

  return (
    <header>
      <div className="border-b-[4px] border-navy bg-cream-warm">
        <Container className="flex items-center justify-between gap-4 py-3.5 lg:py-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-[11px] border-[3px] border-navy bg-red text-xl lg:size-11 lg:text-[22px]">
              🎳
            </span>
            <span className="font-heading text-2xl font-black tracking-[-1px] text-navy lg:text-[28px]">
              {t("brand")}
              <span className="text-red">.</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-full border-[3px] border-dotted border-navy bg-cream-warm p-[5px] lg:flex">
            {navItems.map((label, i) => (
              <a
                key={label}
                href="#"
                className={cn(
                  "rounded-full px-[18px] py-2 font-heading text-sm font-extrabold",
                  i === 0 ? "bg-navy text-paper" : "text-navy hover:bg-cream"
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-navy bg-paper px-3.5 py-[7px] text-[13px] font-extrabold text-navy">
              {t("header.branch")}
            </div>
            <div className="rounded-full border-[3px] border-navy bg-paper px-3.5 py-2 font-heading text-sm font-extrabold text-navy">
              {t("header.lang")}
            </div>
            <button className="rounded-full border-[3px] border-navy bg-rust px-5 py-2.5 font-heading text-sm font-extrabold text-paper transition-colors hover:bg-red">
              {t("header.whatsapp")}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("header.openMenu")}
            aria-expanded={open}
            className="flex size-11 flex-col items-center justify-center gap-1 rounded-xl border-[3px] border-navy bg-paper lg:hidden"
          >
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
            <span className="h-[2.5px] w-5 rounded bg-navy" />
          </button>
        </Container>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="border-b-[4px] border-navy bg-navy px-5 pt-4 pb-5 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((label, i) => (
              <a
                key={label}
                href="#"
                className={cn(
                  "px-4 py-3 font-heading text-base font-extrabold",
                  i === 0
                    ? "rounded-xl bg-marigold text-navy"
                    : "text-cream-warm"
                )}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3.5 flex gap-2.5">
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-[3px] border-cream-warm bg-paper px-2.5 py-[11px] text-[13px] font-extrabold text-navy">
              {t("header.branch")}
            </div>
            <div className="rounded-full border-[3px] border-cream-warm bg-paper px-4 py-[11px] font-heading text-sm font-extrabold text-navy">
              {t("header.lang")}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
