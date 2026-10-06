"use client"

import { useId, useRef, useState, type FormEvent } from "react"
import { ChevronDown, Eraser } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import SignatureCanvas from "react-signature-canvas"

import { cn } from "@/lib/utils"
import type { BranchId } from "@/lib/branches"
import { TIME_OPTIONS, type BookingFormField } from "@/lib/events/fields"
import { pickLocale } from "@/lib/localized"

const inputClass =
  "w-full min-w-0 rounded-sm border border-border bg-card px-3.5 py-2.5 text-base font-semibold text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary"

const AUTOCOMPLETE: Partial<Record<string, string>> = {
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
}

const INPUT_TYPES: Record<BookingFormField["type"], string> = {
  text: "text",
  textarea: "textarea",
  tel: "tel",
  email: "email",
  id: "text",
  date: "date",
  time: "select",
  number: "number",
  select: "select",
  checkbox: "checkbox",
}

const FIELD_SPAN: Partial<Record<BookingFormField["type"], string>> = {
  email: "col-span-2 lg:col-span-1",
  select: "col-span-2 lg:col-span-1",
  time: "col-span-2 lg:col-span-1",
  textarea: "col-span-full",
}

function BookingFieldInput({
  field,
  value,
  onChange,
  locale,
}: {
  field: BookingFormField
  value: string
  onChange: (value: string) => void
  locale: "he" | "en"
}) {
  const t = useTranslations("eventDetails.form")
  const noteId = useId()
  const label = pickLocale(field.label, locale)
  const placeholder = pickLocale(field.placeholder, locale)
  const isTime = field.type === "time"
  const isChoice = field.type === "select" || isTime
  const options = isTime ? TIME_OPTIONS : (field.options ?? [])

  if (isChoice && !options.length) return null

  if (field.type === "checkbox") {
    return (
      <label className="col-span-full flex items-center gap-2.5 text-[14px] font-semibold text-foreground">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          required={field.isRequired}
          className="size-4 shrink-0 accent-primary"
        />
        {label}
      </label>
    )
  }

  return (
    <label
      className={cn("flex min-w-0 flex-col gap-1", FIELD_SPAN[field.type])}
    >
      <span className="font-heading text-[13px] font-extrabold text-navy">
        {label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          className={cn(inputClass, "h-20 resize-none")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || undefined}
          required={field.isRequired}
        />
      ) : isChoice ? (
        <div className="relative">
          <select
            className={cn(inputClass, "appearance-none pe-11")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            aria-describedby={isTime ? noteId : undefined}
          >
            <option value="">{placeholder || "—"}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {pickLocale(opt.label, locale)}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-navy"
            strokeWidth={3}
          />
        </div>
      ) : (
        <input
          type={INPUT_TYPES[field.type]}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || undefined}
          required={field.isRequired}
          inputMode={field.type === "id" ? "numeric" : undefined}
          autoComplete={AUTOCOMPLETE[field.key]}
          min={
            field.type === "number" ? (field.minValue ?? undefined) : undefined
          }
          max={
            field.type === "number" ? (field.maxValue ?? undefined) : undefined
          }
        />
      )}
      {isTime ? (
        <span
          id={noteId}
          aria-hidden
          className="text-[12px] leading-snug font-semibold text-mud"
        >
          {t("timeNote")}
        </span>
      ) : null}
    </label>
  )
}

interface BookingFormProps {
  branchId: BranchId
  event: string
  slug: string
  terms: string
  formFields: BookingFormField[]
  requiresSignature: boolean
  upgrades: {
    title: string
    note: string
    items: { title: string; price: string }[]
  }
  footnote: string
}

interface BookingSummary {
  rows: { label: string; value: string }[]
  note?: string
}

export interface EventBooking {
  intro: string
  summary?: BookingSummary
  form: BookingFormProps
}

function BookingForm({
  branchId,
  event,
  slug,
  terms,
  formFields,
  requiresSignature,
  upgrades,
  footnote,
}: BookingFormProps) {
  const t = useTranslations("eventDetails.form")
  const locale = useLocale() as "he" | "en"
  const sigRef = useRef<SignatureCanvas>(null)

  const [values, setValues] = useState<Record<string, string>>({})
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!agreed) {
      setError(t("errorTerms"))
      return
    }
    if (requiresSignature && (sigRef.current?.isEmpty() ?? true)) {
      setError(t("errorSignature"))
      return
    }

    const signature = requiresSignature
      ? sigRef.current?.toDataURL("image/png")
      : undefined

    setStatus("sending")
    try {
      const res = await fetch("/api/events/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          slug,
          ...values,
          labels: Object.fromEntries(
            formFields.map((field) => [
              field.key,
              pickLocale(field.label, "he"),
            ])
          ),
          types: Object.fromEntries(
            formFields.map((field) => [field.key, field.type])
          ),
          branch: branchId,
          signature,
        }),
      })
      if (!res.ok) throw new Error("request failed")
      setStatus("sent")
      setValues({})
      setAgreed(false)
      sigRef.current?.clear()
    } catch {
      setStatus("error")
      setError(t("error"))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-3xl flex-col gap-4 rounded-sm border border-primary bg-card p-4 lg:p-6"
    >
      <label className="flex items-start gap-2.5 rounded-sm border border-primary/40 bg-background p-3 text-[13px] leading-relaxed font-bold text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        {terms}
      </label>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {formFields.map((field) => (
          <BookingFieldInput
            key={field.key}
            field={field}
            value={values[field.key] ?? ""}
            onChange={(value) => setValue(field.key, value)}
            locale={locale}
          />
        ))}
      </div>

      {upgrades.items.length ? (
        <section
          aria-labelledby="booking-upgrades"
          className="rounded-sm border border-primary/40 bg-background p-3"
        >
          <h3
            id="booking-upgrades"
            className="font-heading text-[14px] font-black text-navy"
          >
            {upgrades.title}
          </h3>
          <p className="mt-0.5 text-[12.5px] leading-snug font-semibold text-mud">
            {upgrades.note}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {upgrades.items.map((u) => (
              <li
                key={u.title}
                className="rounded-sm border border-border bg-card px-2.5 py-1 text-[12.5px] font-bold text-foreground"
              >
                {u.title}
                {u.price ? (
                  <span className="ms-1.5 font-heading font-black whitespace-nowrap text-rust">
                    {u.price}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {requiresSignature ? (
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div>
              <div className="font-heading text-[14px] font-black text-navy">
                {t("signatureTitle")}
              </div>
              <p className="text-[12px] font-semibold text-mud">
                {t("signatureHint")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => sigRef.current?.clear()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-1.5 font-heading text-[12.5px] font-extrabold text-mud transition-colors hover:border-primary hover:text-navy"
            >
              <Eraser className="size-3.5" strokeWidth={2.5} />
              {t("signatureClear")}
            </button>
          </div>
          <div className="overflow-hidden rounded-sm border border-border bg-white">
            <SignatureCanvas
              ref={sigRef}
              penColor="#0f172a"
              canvasProps={{ className: "h-32 w-full touch-none lg:h-36" }}
            />
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!agreed || status === "sending"}
        className="glow-primary w-full rounded-sm border border-primary bg-primary px-5 py-3 font-heading text-[16px] font-black text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50 lg:text-[17px]"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>

      <div aria-live="polite" className="empty:hidden">
        {status === "sent" ? (
          <p className="text-center text-[13.5px] font-bold text-secondary">
            {t("success")}
          </p>
        ) : null}
        {error ? (
          <p className="text-center text-[13.5px] font-bold text-rust">
            {error}
          </p>
        ) : null}
      </div>

      {footnote ? (
        <p className="text-center text-[12px] font-medium text-mud">
          {footnote}
        </p>
      ) : null}
    </form>
  )
}

function SummaryBox({ summary }: { summary: BookingSummary }) {
  const t = useTranslations("eventDetails")

  return (
    <div className="mx-auto mb-4 max-w-3xl rounded-sm border border-border bg-card p-4 lg:p-5">
      <div className="font-heading text-[15px] font-black text-navy">
        {t("summaryTitle")}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {summary.rows.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
          >
            <span className="text-[13.5px] font-semibold text-foreground">
              {r.label}
            </span>
            <span className="font-heading text-[16px] font-black whitespace-nowrap text-rust">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      {summary.note ? (
        <p className="mt-3 text-[12.5px] font-semibold text-mud">
          {summary.note}
        </p>
      ) : null}
    </div>
  )
}

export function BookingPanel({ booking }: { booking: EventBooking }) {
  return (
    <>
      {booking.summary ? <SummaryBox summary={booking.summary} /> : null}
      <BookingForm {...booking.form} />
    </>
  )
}
