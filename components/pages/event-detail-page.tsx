"use client"

import {
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type SVGProps,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, ChevronDown, Eraser, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import SignatureCanvas from "react-signature-canvas"

import { cn } from "@/lib/utils"
import { branchPath, type BranchId } from "@/lib/branches"
import type { SiteEventLocation } from "@/lib/db/queries/site"
import type { Localized } from "@/lib/db/schema/_shared"
import type { BookingFormField } from "@/lib/events/fields"
import { usesContactForm } from "@/lib/events/slugs"
import { isOptimizableImage } from "@/lib/images"
import { formatPrice, pickLocale } from "@/lib/localized"
import { useBranch } from "@/components/branch-context"
import {
  BirthdaysIllustration,
  CorporateIllustration,
  GymboreeIllustration,
  NoRoomIllustration,
  TeamIllustration,
} from "@/components/illustrations"
import { Contact } from "@/components/home/contact"
import { Container } from "@/components/home/container"

const ILLUSTRATIONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  birthdays: BirthdaysIllustration,
  "no-room": NoRoomIllustration,
  team: TeamIllustration,
  gymboree: GymboreeIllustration,
  corporate: CorporateIllustration,
}
const HERO_PHOTOS: Record<string, string> = {
  birthdays: "/events/birthdays-hero.png",
}

const BADGE_ACCENTS = [
  "border-primary text-primary",
  "border-secondary text-secondary",
  "border-primary text-primary",
]

interface Step {
  icon: string
  title: string
  desc: string
}
interface Extra {
  title: string
  desc?: string
  price: string
}
interface PriceCard {
  tag?: string
  sub?: string
  label: string
  price: string
  note?: string
  note2?: string
}
interface PolicyRow {
  title: string
  desc: string
}
interface FormConfig {
  countLabel: string
  countPlaceholder: string
  celebrant: boolean
  policyCheckbox: boolean
}
interface BookingTexts {
  intro: string
  terms: string
  footnote: string
}
interface FormSummary {
  rows: { label: string; value: string }[]
  note?: string
}
interface EventItem {
  badges: string[]
  title: string
  lead?: string
  description: string
  schedule?: { note: string; footnote: string; steps: Step[] }
  scheduleTitle?: string
  price?: { note?: string; cards: PriceCard[] }
  included?: string[]
  includedTitle?: string
  includedNotes?: string[]
  allowed?: string[]
  forbidden?: string[]
  rulesFootnote?: string
  extras?: Extra[]
  extrasTitle?: string
  extrasNote?: string
  policy?: PolicyRow[]
  policyFootnote?: string
  groupOptions?: string[]
  groupOptionsTitle?: string
  form?: FormConfig
  formSummary?: FormSummary
}

const inputClass =
  "rounded-sm border border-border bg-card px-4 py-3 text-[15px] font-semibold text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary lg:py-3.5"

function SectionHeading({
  title,
  note,
  onDark,
}: {
  title: string
  note?: string
  onDark?: boolean
}) {
  return (
    <div className="mb-5 lg:mb-7">
      <h2
        className={cn(
          "font-heading text-[28px] font-black tracking-[-1px] lg:text-[36px]",
          onDark ? "text-navy" : "text-navy"
        )}
      >
        {title}
      </h2>
      {note ? (
        <p
          className={cn(
            "mt-1 text-sm font-semibold lg:text-[15px]",
            onDark ? "text-muted-foreground" : "text-mud"
          )}
        >
          {note}
        </p>
      ) : null}
    </div>
  )
}

function Hero({
  slug,
  image,
  data,
  backLabel,
  bookLabel,
}: {
  slug: string
  image?: string | null
  data: EventItem
  backLabel: string
  bookLabel: string
}) {
  const { branchId } = useBranch()
  const photo = image || HERO_PHOTOS[slug]
  const Illustration = ILLUSTRATIONS[slug] ?? BirthdaysIllustration

  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
      <div className="order-1">
        <Link
          href={branchPath(branchId, "/events")}
          className="inline-flex items-center gap-1.5 font-heading text-[13px] font-extrabold text-mud transition-colors hover:text-navy"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" strokeWidth={3} />
          {backLabel}
        </Link>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.badges.map((b, i) => (
            <span
              key={b}
              className={cn(
                "glow-primary rounded-sm border bg-card px-3 py-1 font-heading text-[12.5px] font-extrabold",
                BADGE_ACCENTS[i % BADGE_ACCENTS.length]
              )}
            >
              {b}
            </span>
          ))}
        </div>
        <h1 className="neon-sign-purple mt-3.5 font-heading text-[40px] leading-[1.02] font-black tracking-[-1.5px] lg:text-[56px]">
          {data.title}
        </h1>
        {data.lead ? (
          <p className="mt-4 text-[16px] leading-[1.5] font-black text-navy lg:text-[18px]">
            {data.lead}
          </p>
        ) : null}
        <p className="mt-3 max-w-xl text-[15px] leading-[1.6] font-semibold text-mud lg:text-[17px]">
          {data.description}
        </p>
        <a
          href="#book"
          className="glow-primary mt-6 inline-flex items-center gap-2 rounded-sm border border-primary bg-primary px-6 py-3.5 font-heading text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:text-base"
        >
          {bookLabel}
          <ArrowLeft className="size-4 ltr:rotate-180" strokeWidth={3} />
        </a>
      </div>

      <div className="relative order-2 mt-6 aspect-[4/3] overflow-hidden rounded-sm border border-primary bg-card lg:mt-0">
        {photo ? (
          <Image
            src={photo}
            alt={data.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            unoptimized={!isOptimizableImage(photo)}
            priority
          />
        ) : (
          <Illustration className="absolute inset-0 h-full w-full p-8" />
        )}
      </div>
    </div>
  )
}

function Schedule({
  data,
  title,
}: {
  data: NonNullable<EventItem["schedule"]>
  title: string
}) {
  return (
    <div>
      <SectionHeading title={title} note={data.note || undefined} onDark />
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4 lg:gap-x-8">
        {data.steps.map((step, i) => (
          <div key={i} className="border-t-2 border-primary/40 pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-[13px] font-black text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-heading text-base font-extrabold text-navy lg:text-[19px]">
                {step.title}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-mud lg:text-sm">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
      {data.footnote ? (
        <p className="mt-5 text-[13px] font-semibold text-muted-foreground italic">
          {data.footnote}
        </p>
      ) : null}
    </div>
  )
}

function PriceSection({
  cards,
  title,
  note,
}: {
  cards: PriceCard[]
  title: string
  note?: string
}) {
  return (
    <div>
      <SectionHeading title={title} note={note} />
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "border-t-2 pt-4",
              card.tag ? "border-primary" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {card.sub ? (
                  <div className="font-mono text-[12.5px] font-bold text-mud">
                    {card.sub}
                  </div>
                ) : null}
                <div className="mt-0.5 font-heading text-[19px] font-black text-navy">
                  {card.label}
                </div>
              </div>
              {card.tag ? (
                <span className="flex-none rounded-sm bg-primary px-3 py-0.5 font-heading text-[11px] font-extrabold text-primary-foreground">
                  {card.tag}
                </span>
              ) : null}
            </div>
            <div className="mt-4 font-heading text-[44px] leading-none font-black text-primary">
              {card.price}
            </div>
            {card.note ? (
              <div className="mt-2 text-[12.5px] font-semibold text-mud">
                {card.note}
              </div>
            ) : null}
            {card.note2 ? (
              <div className="mt-2 inline-block border-b-2 border-primary/40 pb-0.5 font-heading text-[12px] font-extrabold text-navy">
                {card.note2}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function IncludedSection({
  items,
  title,
  notes,
}: {
  items: string[]
  title: string
  notes?: string[]
}) {
  return (
    <div>
      <SectionHeading title={title} />
      <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 border-b border-border/60 pb-3"
          >
            <Check
              className="mt-0.5 size-4 flex-none text-primary"
              strokeWidth={3}
            />
            <span className="text-[15px] leading-relaxed font-semibold text-foreground">
              {item}
            </span>
          </li>
        ))}
      </ul>
      {notes && notes.length ? (
        <ul className="mt-4 flex flex-col gap-1.5">
          {notes.map((n) => (
            <li key={n} className="text-[13px] font-semibold text-mud">
              · {n}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function RuleCard({
  heading,
  items,
  ok,
}: {
  heading: string
  items: string[]
  ok: boolean
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 border-b-2 pb-2.5",
          ok ? "border-primary/40" : "border-red/40"
        )}
      >
        <span
          className={cn(
            "flex size-7 flex-none items-center justify-center rounded-full",
            ok ? "bg-primary" : "bg-red"
          )}
        >
          {ok ? (
            <Check className="size-4 text-primary-foreground" strokeWidth={3} />
          ) : (
            <X className="size-4 text-secondary-foreground" strokeWidth={3} />
          )}
        </span>
        <span className="font-heading text-[18px] font-black text-navy">
          {heading}
        </span>
      </div>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            {ok ? (
              <Check
                className="mt-0.5 size-4 flex-none text-primary"
                strokeWidth={3}
              />
            ) : (
              <X className="mt-0.5 size-4 flex-none text-red" strokeWidth={3} />
            )}
            <span className="text-[14.5px] leading-relaxed font-semibold text-foreground">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RulesSection({
  allowed,
  forbidden,
  title,
  allowedTitle,
  forbiddenTitle,
  footnote,
}: {
  allowed: string[]
  forbidden: string[]
  title: string
  allowedTitle: string
  forbiddenTitle: string
  footnote?: string
}) {
  return (
    <div>
      <SectionHeading title={title} />
      <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
        {allowed.length ? (
          <RuleCard heading={allowedTitle} items={allowed} ok />
        ) : null}
        {forbidden.length ? (
          <RuleCard heading={forbiddenTitle} items={forbidden} ok={false} />
        ) : null}
      </div>
      {footnote ? (
        <p className="mt-5 text-[13px] font-semibold text-mud italic">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}

function ExtrasSection({
  extras,
  title,
  note,
}: {
  extras: Extra[]
  title: string
  note: string
}) {
  return (
    <div>
      <SectionHeading title={title} note={note} />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {extras.map((extra, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <div>
              <div className="font-heading text-[15px] font-black text-navy">
                {extra.title}
              </div>
              {extra.desc ? (
                <div className="mt-1 text-[12.5px] leading-snug font-semibold text-mud">
                  {extra.desc}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 font-heading text-[15px] font-black whitespace-nowrap text-rust">
              {extra.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TermsSection({
  rows,
  title,
  note,
  footnote,
}: {
  rows: PolicyRow[]
  title: string
  note: string
  footnote?: string
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading title={title} note={note} />
      <div className="space-y-4 text-[14px] leading-[1.8] font-semibold text-mud lg:text-[15px]">
        {rows.map((row, i) => (
          <p key={i}>
            <strong className="font-heading font-black text-navy">
              {row.title}
            </strong>
            {" – "}
            {row.desc}
          </p>
        ))}
      </div>
      {footnote ? (
        <p className="mt-5 text-[13px] font-semibold text-mud italic">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}

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
  number: "number",
  select: "select",
  checkbox: "checkbox",
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
  const label = pickLocale(field.label, locale)
  const placeholder = pickLocale(field.placeholder, locale)

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-[14px] font-semibold text-foreground sm:col-span-2">
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
    <label className="flex flex-col gap-1.5">
      <span className="font-heading text-[13px] font-extrabold text-navy">
        {label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          className={cn(inputClass, "h-24 resize-none")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || undefined}
          required={field.isRequired}
        />
      ) : field.type === "select" ? (
        <div className="relative">
          <select
            className={cn(inputClass, "w-full appearance-none pe-11")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
          >
            <option value="">{placeholder || "—"}</option>
            {(field.options ?? []).map((opt) => (
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
    </label>
  )
}

function BookingForm({
  event,
  texts,
  upgrades,
  formFields,
  requiresSignature,
}: {
  event: string
  texts: BookingTexts
  upgrades?: Extra[]
  formFields: BookingFormField[]
  requiresSignature: boolean
}) {
  const t = useTranslations("eventDetails.form")
  const { branchId } = useBranch()
  const locale = useLocale() as "he" | "en"
  const sigRef = useRef<SignatureCanvas>(null)

  const [values, setValues] = useState<Record<string, string>>({})
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const toggleUpgrade = (title: string) =>
    setSelectedUpgrades((prev) =>
      prev.includes(title) ? prev.filter((u) => u !== title) : [...prev, title]
    )

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
          ...values,
          branch: branchId,
          upgrades: selectedUpgrades,
          signature,
        }),
      })
      if (!res.ok) throw new Error("request failed")
      setStatus("sent")
      setValues({})
      setSelectedUpgrades([])
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
      className="mx-auto flex max-w-3xl flex-col gap-5 rounded-sm border border-primary bg-card p-[22px] lg:p-8"
    >
      <label className="flex items-start gap-2.5 rounded-sm border border-primary/40 bg-background p-4 text-[13.5px] leading-relaxed font-bold text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        {texts.terms}
      </label>

      <div className="grid gap-3.5 sm:grid-cols-2">
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

      {upgrades?.length ? (
        <fieldset>
          <legend className="font-heading text-[15px] font-black text-navy">
            {t("upgradesTitle")}
          </legend>
          <p className="mt-0.5 mb-2.5 text-[12.5px] font-semibold text-mud">
            {t("upgradesNote")}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {upgrades.map((u) => {
              const checked = selectedUpgrades.includes(u.title)
              return (
                <label
                  key={u.title}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-sm border p-3 transition-colors",
                    checked
                      ? "glow-primary border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleUpgrade(u.title)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <span className="flex-1">
                    <span className="block font-heading text-[14px] font-extrabold text-navy">
                      {u.title}
                    </span>
                    {u.desc ? (
                      <span className="block text-[12px] font-semibold text-mud">
                        {u.desc}
                      </span>
                    ) : null}
                  </span>
                  <span className="font-heading text-[14px] font-black whitespace-nowrap text-rust">
                    {u.price}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      {requiresSignature ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="font-heading text-[15px] font-black text-navy">
                {t("signatureTitle")}
              </div>
              <p className="text-[12.5px] font-semibold text-mud">
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
              canvasProps={{ className: "h-40 w-full touch-none lg:h-48" }}
            />
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!agreed || status === "sending"}
        className="glow-primary mt-1 w-full rounded-sm border border-primary bg-primary px-5 py-3.5 font-heading text-[17px] font-black text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50 lg:py-4 lg:text-lg"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>

      {status === "sent" ? (
        <p className="text-center text-[13.5px] font-bold text-secondary">
          {t("success")}
        </p>
      ) : null}
      {error ? (
        <p className="text-center text-[13.5px] font-bold text-rust">{error}</p>
      ) : null}

      {texts.footnote ? (
        <p className="text-center text-[12px] font-medium text-mud">
          {texts.footnote}
        </p>
      ) : null}
    </form>
  )
}

function BookingSection({
  event,
  texts,
  upgrades,
  summary,
  formFields,
  requiresSignature,
}: {
  event: string
  texts: BookingTexts
  upgrades?: Extra[]
  summary?: FormSummary
  formFields: BookingFormField[]
  requiresSignature: boolean
}) {
  const t = useTranslations("eventDetails.form")
  const te = useTranslations("eventDetails")

  return (
    <section
      id="book"
      className="mt-10 border-t border-border bg-background py-8 lg:mt-16 lg:py-16"
    >
      <Container>
        <div className="mb-6 text-center lg:mb-9">
          <h2 className="font-heading text-[32px] font-black tracking-[-1px] text-navy lg:text-[46px]">
            {t("title")}
          </h2>
          <div className="glow-primary mx-auto mt-3 h-[7px] w-[70px] rounded-full bg-primary lg:w-20" />
          {texts.intro ? (
            <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] font-semibold text-muted-foreground lg:text-[16px]">
              {texts.intro}
            </p>
          ) : null}
        </div>

        {summary ? (
          <div className="mx-auto mb-4 max-w-3xl rounded-sm border border-border bg-card p-5 lg:p-6">
            <div className="font-heading text-[15px] font-black text-navy">
              {te("summaryTitle")}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {summary.rows.map((r) => (
                <div
                  key={r.label}
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
        ) : null}

        <BookingForm
          event={event}
          texts={texts}
          upgrades={upgrades}
          formFields={formFields}
          requiresSignature={requiresSignature}
        />
      </Container>
    </section>
  )
}

export function EventDetailPage({
  slug,
  events,
  defaultFormFields,
}: {
  slug: string
  events: Partial<Record<BranchId, SiteEventLocation>>
  defaultFormFields: BookingFormField[]
}) {
  const t = useTranslations("eventDetails")
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const items = t.raw("items") as Record<string, EventItem>
  const overrides = t.raw("branch") as Record<string, Record<string, EventItem>>
  const messageData: EventItem = overrides?.[branch.id]?.[slug] ??
    items[slug] ?? { badges: [], title: "", description: "" }

  const dbTypes = events[branch.id]?.eventTypes ?? []
  const dbType = dbTypes.find((e) => e.slug === slug)
  const content = dbType?.content
  const pick = (value: Localized) => pickLocale(value, locale)
  const pickOr = <T extends string | undefined>(
    value: Localized | null | undefined,
    fallback: T
  ): string | T => (value ? pick(value) : fallback)
  const money = (amount: number) => formatPrice(amount, locale)
  const childCount = content?.packageChildrenCount
  const extraChild = content?.extraChildAmount
  const deposit = content?.depositAmount
  const extraChildNote =
    extraChild == null
      ? undefined
      : childCount
        ? t("package.extraOver", {
            count: childCount,
            price: money(extraChild),
          })
        : t("package.extra", { price: money(extraChild) })
  const packagePrice: EventItem["price"] =
    content?.packageAmount != null
      ? {
          note:
            deposit != null
              ? t("package.deposit", { price: money(deposit) })
              : undefined,
          cards: [
            {
              label: t("package.label"),
              price: money(content.packageAmount),
              note: childCount
                ? t("package.upTo", { count: childCount })
                : undefined,
              note2: extraChildNote,
            },
          ],
        }
      : undefined
  const steps: Step[] = dbType
    ? dbType.steps.map((s) => ({
        icon: "",
        title: pick(s.title),
        desc: pickLocale(s.description, locale),
      }))
    : (messageData.schedule?.steps ?? [])
  const data: EventItem = {
    ...messageData,
    title:
      pickLocale(dbType?.content?.heroTitle, locale) ||
      messageData.title ||
      pickLocale(dbType?.name, locale),
    description:
      pickLocale(dbType?.content?.heroDescription, locale) ||
      messageData.description,
    schedule: steps.length
      ? {
          note: messageData.schedule?.note ?? "",
          footnote: messageData.schedule?.footnote ?? "",
          steps,
        }
      : undefined,
    price: packagePrice ?? messageData.price,
    included: dbType
      ? dbType.packageLines.map((l) => pick(l.label))
      : messageData.included,
    extras: dbType
      ? dbType.upgrades.map((u) => ({
          title: pick(u.label),
          price: u.amount != null ? money(u.amount) : "",
        }))
      : messageData.extras,
    allowed: content?.allowedItems?.map(pick) ?? messageData.allowed,
    forbidden: content?.forbiddenItems?.map(pick) ?? messageData.forbidden,
    rulesFootnote: pickOr(content?.rulesNote, messageData.rulesFootnote),
    policy:
      content?.policyItems?.map((row) => ({
        title: pick(row.title),
        desc: pick(row.description),
      })) ?? messageData.policy,
    policyFootnote: pickOr(content?.policyNote, messageData.policyFootnote),
  }
  const bookingTexts: BookingTexts = {
    intro: pickOr(content?.formIntro, t("form.desc")),
    terms: pickLocale(content?.formTerms, locale) || t("form.termsConfirm"),
    footnote: pickOr(content?.formFootnote, t("form.footnote")),
  }

  const available = dbTypes.length
    ? Boolean(dbType)
    : branch.events.includes(slug)

  if (!available) {
    return (
      <Container className="py-16 text-center lg:py-24">
        <h1 className="font-heading text-[32px] font-black tracking-[-1px] text-navy lg:text-[44px]">
          {t("notAvailable.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] font-semibold text-mud lg:text-[17px]">
          {t("notAvailable.body")}
        </p>
        <Link
          href={branchPath(branch.id, "/events")}
          className="glow-primary mt-6 inline-flex items-center gap-2 rounded-sm border border-primary bg-primary px-6 py-3.5 font-heading text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
        >
          {t("notAvailable.cta")}
          <ArrowLeft className="size-4 ltr:rotate-180" strokeWidth={3} />
        </Link>
      </Container>
    )
  }

  return (
    <>
      <Container className="pt-9 pb-10 lg:pt-14 lg:pb-14">
        <Hero
          slug={slug}
          image={content?.heroImageUrl}
          data={data}
          backLabel={t("backToEvents")}
          bookLabel={t("bookCta")}
        />
      </Container>

      {data.schedule ? (
        <section className="border-y border-border bg-background py-10 lg:py-14">
          <Container>
            <Schedule
              data={data.schedule}
              title={
                pickLocale(content?.scheduleTitle, locale) ||
                messageData.scheduleTitle ||
                t("scheduleTitle")
              }
            />
          </Container>
        </section>
      ) : null}

      <Container className="flex flex-col gap-12 py-10 lg:gap-16 lg:py-14">
        {data.price ? (
          <PriceSection
            cards={data.price.cards}
            title={t("priceTitle")}
            note={data.price.note}
          />
        ) : null}
        {data.included?.length ? (
          <IncludedSection
            items={data.included}
            title={data.includedTitle ?? t("includedTitle")}
            notes={data.includedNotes}
          />
        ) : null}
        {data.groupOptions?.length ? (
          <IncludedSection
            items={data.groupOptions}
            title={data.groupOptionsTitle ?? t("includedTitle")}
          />
        ) : null}
        {data.allowed?.length || data.forbidden?.length ? (
          <RulesSection
            allowed={data.allowed ?? []}
            forbidden={data.forbidden ?? []}
            title={t("rulesTitle")}
            allowedTitle={t("allowedTitle")}
            forbiddenTitle={t("forbiddenTitle")}
            footnote={data.rulesFootnote}
          />
        ) : null}
        {data.extras?.length ? (
          <ExtrasSection
            extras={data.extras}
            title={data.extrasTitle ?? t("extrasTitle")}
            note={data.extrasNote ?? t("extrasNote")}
          />
        ) : null}
      </Container>

      {data.policy?.length ? (
        <section className="border-t border-border bg-background py-10 lg:py-14">
          <Container>
            <TermsSection
              rows={data.policy}
              title={t("policyTitle")}
              note={t("policyNote")}
              footnote={data.policyFootnote}
            />
          </Container>
        </section>
      ) : null}

      {usesContactForm(slug) ? (
        <div id="book" className="scroll-mt-20">
          <Contact />
        </div>
      ) : data.form || dbType?.formFields.length ? (
        <BookingSection
          event={data.title}
          texts={bookingTexts}
          upgrades={data.extras}
          summary={data.formSummary}
          formFields={
            dbType?.formFields.length ? dbType.formFields : defaultFormFields
          }
          requiresSignature={dbType?.content?.requiresSignature ?? true}
        />
      ) : null}
    </>
  )
}
