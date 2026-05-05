"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { IconCheck } from "@tabler/icons-react"
import { BowlingCard } from "@/components/brand/bowling-card"
import { RetroButton } from "@/components/brand/retro-button"
import { Eyebrow } from "@/components/common/eyebrow"

const DENOMS = [100, 150, 200, 300, 500] as const

export function VouchersForm() {
  const t = useTranslations("Vouchers")
  const [amount, setAmount] = React.useState<number | "custom">(150)
  const [agree, setAgree] = React.useState(false)
  const customRef = React.useRef<HTMLInputElement>(null)
  const [customAmount, setCustomAmount] = React.useState("")

  const showAmount =
    amount === "custom"
      ? customAmount.trim()
        ? `₪ ${Number(customAmount).toLocaleString()}`
        : "—"
      : `₪ ${amount}`

  return (
    <>
      <section className="bg-cream-2">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <Eyebrow tone="red">{t("amountTitle")}</Eyebrow>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {DENOMS.map((d) => {
              const active = amount === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setAmount(d)}
                  className={`grid h-14 place-items-center rounded-lg border-2 border-ink font-display text-lg shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px] ${
                    active
                      ? "bg-ink text-cream"
                      : "bg-paper text-ink hover:bg-cream"
                  }`}
                >
                  ₪ {d}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => {
                setAmount("custom")
                customRef.current?.focus()
              }}
              className={`grid h-14 place-items-center rounded-lg border-2 border-ink text-sm font-bold shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px] ${
                amount === "custom"
                  ? "bg-ink text-cream"
                  : "bg-paper text-ink hover:bg-cream"
              }`}
            >
              {t("customAmount")}
            </button>
          </div>
          {amount === "custom" ? (
            <input
              ref={customRef}
              type="number"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="₪ 250"
              dir="ltr"
              className="mt-3 h-12 w-full rounded-lg border-2 border-ink bg-paper px-3 text-base font-bold text-ink shadow-block-sm focus:outline-none"
            />
          ) : null}
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <Eyebrow tone="ink">{t("recipientTitle")}</Eyebrow>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              label={t("fields.fromName")}
              placeholder={t("fields.fromNamePh")}
            />
            <Field
              label={t("fields.toName")}
              placeholder={t("fields.toNamePh")}
            />
            <Field
              label={t("fields.toEmail")}
              placeholder="name@example.com"
              dir="ltr"
            />
            <Field
              label={t("fields.toPhone")}
              placeholder="050-0000000"
              dir="ltr"
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-[10px] font-bold tracking-[0.18em] text-ink/70 uppercase">
                {t("fields.message")}
              </label>
              <textarea
                rows={3}
                placeholder={t("fields.messagePh")}
                className="w-full resize-none rounded-lg border-2 border-ink bg-paper px-3 py-2.5 text-sm text-ink shadow-block-sm focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink text-cream">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <BowlingCard
            surface="ink"
            ring="yellow"
            shadow="lg"
            contentClassName="px-5 py-5"
          >
            <div className="flex items-end justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[0.18em] text-cream/60 uppercase">
                {t("totalLabel")}
              </span>
              <span className="font-display text-3xl text-yellow">
                {showAmount}
              </span>
            </div>
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
              <span className="text-xs leading-snug text-cream/80">
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
            <p className="mt-3 text-center text-[11px] text-cream/60">
              {t("comingSoon")}
            </p>
          </BowlingCard>
        </div>
      </section>
    </>
  )
}

function Field({
  label,
  placeholder,
  dir,
}: {
  label: string
  placeholder?: string
  dir?: "ltr" | "rtl"
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] font-bold tracking-[0.18em] text-ink/70 uppercase">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        dir={dir}
        className="h-11 w-full rounded-lg border-2 border-ink bg-paper px-3 text-sm text-ink shadow-block-sm focus:outline-none"
      />
    </div>
  )
}
