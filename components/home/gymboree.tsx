"use client"

import { Clock, Ticket, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

import { useBranch } from "@/components/branch-context"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

type Row = { label: string; value: string }

const cardClass =
  "rounded-sm border border-border bg-card p-5 lg:p-6"

export function Gymboree() {
  const t = useTranslations("gymboree")
  const { branch } = useBranch()

  // Only Rishon LeZion offers the gymboree + bumper tubes.
  if (!branch.hasGymboree) return null

  const entryRows = t.raw("entry.rows") as Row[]
  const hoursRows = t.raw("hours.rows") as Row[]

  return (
    <section className="mt-6 border-t border-navy py-8 lg:mt-14 lg:py-16">
      <Container>
        <div className="mb-6 text-center lg:mb-9">
          <span className="font-mono text-xs font-bold text-secondary lg:text-sm"><LedDot color="secondary" className="me-2 align-middle" />
            {t("eyebrow")}
          </span>
          <h2 className="mt-1.5 font-heading text-[34px] font-black tracking-[-1px] text-foreground neon-sign-purple lg:text-[48px]">
            {t("title")}
          </h2>
          <div className="mx-auto mt-3 h-[7px] w-[70px] rounded-sm bg-primary lg:w-20" />
        </div>

        <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {/* Bumper tubes — price highlight */}
          <div className={cardClass}>
            <Zap className="size-5 text-rust" strokeWidth={2.5} />
            <div className="mt-1.5 font-heading text-[17px] font-extrabold text-navy lg:mt-2 lg:text-lg">
              {t("bumpers.title")}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-heading text-[36px] leading-none font-black text-rust">
                {t("bumpers.price")}
              </span>
              <span className="text-[13px] font-bold text-mud">
                {t("bumpers.priceNote")}
              </span>
            </div>
            <p className="mt-2.5 text-[12.5px] leading-snug font-semibold text-mud">
              {t("bumpers.desc")}
            </p>
          </div>

          {/* Gymboree entry — pricing rows */}
          <div className={cardClass}>
            <Ticket className="size-5 text-rust" strokeWidth={2.5} />
            <div className="mt-1.5 font-heading text-[17px] font-extrabold text-navy lg:mt-2 lg:text-lg">
              {t("entry.title")}
            </div>
            <div className="text-[13px] font-semibold text-mud lg:text-sm">
              {t("entry.subtitle")}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {entryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-t-2 border-navy/10 pt-2 first:border-t-0 first:pt-0"
                >
                  <span className="text-[13px] font-semibold text-navy">
                    {row.label}
                  </span>
                  <span className="font-heading text-[16px] font-black whitespace-nowrap text-rust">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Opening hours */}
          <div className={cardClass}>
            <Clock className="size-5 text-rust" strokeWidth={2.5} />
            <div className="mt-1.5 font-heading text-[17px] font-extrabold text-navy lg:mt-2 lg:text-lg">
              {t("hours.title")}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {hoursRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-t-2 border-navy/10 pt-2 first:border-t-0 first:pt-0"
                >
                  <span className="text-[13px] font-semibold text-navy">
                    {row.label}
                  </span>
                  <span className="font-heading text-[14px] font-black whitespace-nowrap text-navy">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
