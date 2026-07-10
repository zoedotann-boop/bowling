"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "@/components/home/container"

type Category = {
  id: string
  label: string
  items: { name: string; price: string; desc: string }[]
}

export function MenuPage() {
  const t = useTranslations("menuPage")
  const categories = t.raw("categories") as Category[]
  const [active, setActive] = useState(categories[0].id)
  const current = categories.find((c) => c.id === active) ?? categories[0]

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-mud lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Category tabs */}
        <aside className="lg:w-52 lg:flex-none">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "shrink-0 rounded-sm border px-4 py-2 font-heading text-[13px] font-extrabold transition-colors lg:text-start lg:text-sm",
                  active === c.id
                    ? "glow-primary border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Items */}
        <div className="grid flex-1 grid-cols-1 content-start gap-3 sm:grid-cols-2">
          {current.items.map((d) => (
            <div
              key={d.name}
              className="rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-heading text-[15px] font-black text-navy lg:text-base">
                  {d.name}
                </div>
                <div className="shrink-0 font-heading text-[15px] font-black whitespace-nowrap text-rust lg:text-base">
                  {d.price}
                </div>
              </div>
              {d.desc && (
                <div className="mt-1.5 text-[12.5px] leading-snug font-semibold text-mud">
                  {d.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-[12.5px] font-medium text-faint">{t("note")}</p>
    </Container>
  )
}
