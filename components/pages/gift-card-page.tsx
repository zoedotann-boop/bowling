"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "@/components/home/container"

export function GiftCardPage() {
  const t = useTranslations("giftCardPage")
  const amounts = t.raw("amounts") as string[]
  const perks = t.raw("perks") as { title: string; desc: string }[]
  const [amount, setAmount] = useState(amounts[1])

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-8 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] font-semibold text-mud lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        {/* Card visual */}
        <div className="glow-primary relative overflow-hidden rounded-sm border-2 border-primary bg-card p-7 lg:p-9">
          <div
            className="pointer-events-none absolute -top-16 -left-16 size-48 rounded-full bg-secondary/20"
            aria-hidden
          />
          <div className="relative flex items-center justify-between">
            <span className="font-heading text-xl font-black text-foreground lg:text-2xl">
              {t("cardName")}
            </span>
            <span className="text-2xl">🎳</span>
          </div>
          <div className="text-glow-primary relative mt-12 font-heading text-[44px] font-black text-primary lg:mt-16 lg:text-[56px]">
            {amount}
          </div>
          <div className="relative mt-2 font-mono text-xs font-bold text-muted-foreground">
            {t("cardTagline")}
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="font-heading text-sm font-extrabold text-navy">
            {t("amountLabel")}
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {amounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={cn(
                  "rounded-sm border px-5 py-2.5 font-heading text-[15px] font-extrabold transition-colors",
                  amount === a
                    ? "glow-primary border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="glow-primary mt-6 w-full rounded-sm border border-primary bg-primary px-6 py-4 font-heading text-[17px] font-black text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground sm:w-auto">
            {t("cta")} ←
          </button>
          <p className="mt-4 text-[13px] font-semibold text-mud">{t("note")}</p>
        </div>
      </div>

      {/* Perks */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-14">
        {perks.map((p) => (
          <div
            key={p.title}
            className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div className="font-heading text-[17px] font-black text-navy">
              {p.title}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-mud">{p.desc}</p>
          </div>
        ))}
      </div>
    </Container>
  )
}
