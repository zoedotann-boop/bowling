"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { IconCheck } from "@tabler/icons-react"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"

const FIELDS = [
  { key: "name", type: "text" },
  { key: "phone", type: "tel" },
  { key: "date", type: "date" },
  { key: "kids", type: "number" },
  { key: "age", type: "number" },
] as const

export function BirthdaysLeadForm() {
  const t = useTranslations("Birthdays.lead")
  const [agree, setAgree] = React.useState(false)

  return (
    <section className="border-t-2 border-ink bg-ink text-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
        <Eyebrow tone="yellow">{t("eyebrow")}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl leading-[1] text-cream sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-cream/70">{t("subtitle")}</p>

        <form className="mt-6 grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div
              key={f.key}
              className={f.key === "name" ? "sm:col-span-2" : ""}
            >
              <label className="mb-1 block font-mono text-[10px] font-bold tracking-[0.18em] text-cream/60 uppercase">
                {t(`fields.${f.key}.label` as "fields.name.label")}
              </label>
              <input
                type={f.type}
                placeholder={t(
                  `fields.${f.key}.placeholder` as "fields.name.placeholder"
                )}
                className="h-11 w-full rounded-lg border-2 border-cream/30 bg-cream/10 px-3 text-sm text-cream placeholder:text-cream/40 focus:border-yellow focus:outline-none"
              />
            </div>
          ))}
        </form>

        <BowlingCard
          surface="ink"
          ring="ink"
          shadow="none"
          className="mt-5 border-cream/15"
          contentClassName="px-4 py-3"
        >
          <p className="text-xs leading-relaxed text-cream/70">{t("note")}</p>
        </BowlingCard>

        <label className="mt-5 flex cursor-pointer items-start gap-2.5 select-none">
          <span
            onClick={() => setAgree((v) => !v)}
            className={`mt-0.5 grid size-5 flex-none place-items-center rounded border-2 border-cream/40 transition ${
              agree ? "bg-cream" : "bg-transparent"
            }`}
          >
            {agree ? (
              <IconCheck className="size-3.5 text-ink" stroke={3} />
            ) : null}
          </span>
          <span className="text-xs leading-snug text-cream/85">
            {t("agree")}
          </span>
        </label>

        <div className="mt-5">
          <RetroButton
            tone={agree ? "yellow" : "outline"}
            size="lg"
            full
            disabled={!agree}
          >
            {t("cta")}
          </RetroButton>
        </div>
        <p className="mt-3 text-center text-[11px] text-cream/55">
          {t("disclaimer")}
        </p>
      </div>
    </section>
  )
}
