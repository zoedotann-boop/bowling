"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
} from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Eraser,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import SignatureCanvas from "react-signature-canvas"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "@/components/home/container"

// Illustrated sticker icons for the corporate offers.
const OFFER_IMAGES: Record<string, string> = {
  drinks: "/events/steps/alcohol.png",
  menu: "/events/steps/menu.png",
  buffet: "/events/steps/buffet.png",
}

// Card illustration shown in the hero. Birthdays uses a real photo.
const EVENT_IMAGES: Record<string, string> = {
  birthdays: "/events/birthdays.png",
  "no-room": "/events/no-room.png",
  team: "/events/team.png",
  gymboree: "/events/gymboree.png",
  corporate: "/events/corporate.png",
}
const HERO_PHOTOS: Record<string, string> = {
  birthdays: "/events/birthdays-hero.png",
}

// Hero badge + Services-style strip accents — neon light strips.
const BADGE_ACCENTS = [
  "border-primary text-primary",
  "border-secondary text-secondary",
  "border-primary text-primary",
]
const STRIPS = [
  "bg-primary",
  "bg-secondary",
  "bg-primary",
  "bg-secondary",
  "bg-primary",
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
  sub: string
  label: string
  price: string
  note: string
  note2?: string
}
interface PolicyRow {
  title: string
  desc: string
}
interface Offer {
  icon: string
  title: string
  desc: string
}
interface FormConfig {
  countLabel: string
  countPlaceholder: string
  celebrant: boolean
  policyCheckbox: boolean
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
  offers?: Offer[]
  form?: FormConfig
  formSummary?: FormSummary
}

// Inputs match the homepage Contact form.
const inputClass =
  "rounded-sm border border-border bg-card px-4 py-3 text-[15px] font-semibold text-foreground placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-primary lg:py-3.5"

// ---------------------------------------------------------------------------
// Section building blocks
// ---------------------------------------------------------------------------

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
  data,
  backLabel,
  bookLabel,
}: {
  slug: string
  data: EventItem
  backLabel: string
  bookLabel: string
}) {
  const photo = HERO_PHOTOS[slug]
  const heroSrc = photo ?? EVENT_IMAGES[slug] ?? EVENT_IMAGES.birthdays

  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
      <div className="order-1">
        <Link
          href="/events"
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

      <div
        className={cn(
          "relative order-2 mt-6 aspect-[4/3] overflow-hidden rounded-sm border border-primary lg:mt-0",
          photo ? "bg-card" : "bg-card"
        )}
      >
        <Image
          src={heroSrc}
          alt={data.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={photo ? "object-cover" : "object-contain p-8"}
          priority
        />
      </div>
    </div>
  )
}

// "מה הלו״ז?" — minimalist numbered timeline (no cards), cyan step numbers for pop.
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
          <div key={step.title} className="border-t-2 border-primary/40 pt-3">
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

// "מחיר" — styled like the homepage Pricing table / birthday CTA.
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
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "border-t-2 pt-4",
              card.tag ? "border-primary" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[12.5px] font-bold text-mud">
                  {card.sub}
                </div>
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
            <div className="mt-2 text-[12.5px] font-semibold text-mud">
              {card.note}
            </div>
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

// "מה כלול" — calm typographic list echoing the terms block, cyan checks for pop.
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
        {items.map((item) => (
          <li
            key={item}
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

// "מותר ואסור" — calm typographic column; cyan accent for allowed, red for forbidden.
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
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
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
        <RuleCard heading={allowedTitle} items={allowed} ok />
        <RuleCard heading={forbiddenTitle} items={forbidden} ok={false} />
      </div>
      {footnote ? (
        <p className="mt-5 text-[13px] font-semibold text-mud italic">
          {footnote}
        </p>
      ) : null}
    </div>
  )
}

// "שדרוגים" — styled like the homepage gift-card perks (dotted cards).
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
        {extras.map((extra) => (
          <div
            key={extra.title}
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

// Terms & conditions — a single, continuous document-style text block.
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
        {rows.map((row) => (
          <p key={row.title}>
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

// A single labelled input, matching the homepage Contact form styling.
function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-heading text-[13px] font-extrabold text-navy">
        {label}
      </span>
      <input className={inputClass} {...props} />
    </label>
  )
}

const EMPTY_FIELDS = {
  firstName: "",
  lastName: "",
  idNumber: "",
  celebrants: "",
  email: "",
  phone: "",
  date: "",
}

// Booking / commitment form. Used by every event (standard + corporate):
// the visitor acknowledges the terms, picks upgrades and signs before sending.
function BookingForm({
  event,
  upgrades,
}: {
  event: string
  upgrades?: Extra[]
}) {
  const t = useTranslations("eventDetails.form")
  const sigRef = useRef<SignatureCanvas>(null)

  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )
  const [error, setError] = useState<string | null>(null)

  const update =
    (key: keyof typeof fields) => (e: ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }))

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
    if (sigRef.current?.isEmpty() ?? true) {
      setError(t("errorSignature"))
      return
    }

    setStatus("sending")
    try {
      const res = await fetch("/api/events/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          ...fields,
          upgrades: selectedUpgrades,
          signature: sigRef.current?.toDataURL("image/png"),
        }),
      })
      if (!res.ok) throw new Error("request failed")
      setStatus("sent")
      setFields(EMPTY_FIELDS)
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
      {/* Mandatory terms acknowledgement, right above the fields. */}
      <label className="flex items-start gap-2.5 rounded-sm border border-primary/40 bg-background p-4 text-[13.5px] leading-relaxed font-bold text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        {t("termsConfirm")}
      </label>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field
          label={t("firstNameLabel")}
          value={fields.firstName}
          onChange={update("firstName")}
          placeholder={t("firstNamePlaceholder")}
          autoComplete="given-name"
          required
        />
        <Field
          label={t("lastNameLabel")}
          value={fields.lastName}
          onChange={update("lastName")}
          placeholder={t("lastNamePlaceholder")}
          autoComplete="family-name"
          required
        />
        <Field
          label={t("idLabel")}
          value={fields.idNumber}
          onChange={update("idNumber")}
          placeholder={t("idPlaceholder")}
          inputMode="numeric"
          required
        />
        <Field
          label={t("celebrantsLabel")}
          value={fields.celebrants}
          onChange={update("celebrants")}
          placeholder={t("celebrantsPlaceholder")}
        />
        <Field
          label={t("emailLabel")}
          type="email"
          value={fields.email}
          onChange={update("email")}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          required
        />
        <Field
          label={t("phoneLabel")}
          type="tel"
          value={fields.phone}
          onChange={update("phone")}
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          required
        />
        <Field
          label={t("dateLabel")}
          type="date"
          value={fields.date}
          onChange={update("date")}
          required
        />
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

      {/* Digital signature pad. */}
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

      <p className="text-center text-[12px] font-medium text-mud">
        {t("footnote")}
      </p>
    </form>
  )
}

// Booking band for standard events — heading, price summary and the form.
function BookingSection({
  event,
  upgrades,
  summary,
}: {
  event: string
  upgrades?: Extra[]
  summary?: FormSummary
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
          <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] font-semibold text-muted-foreground lg:text-[16px]">
            {t("desc")}
          </p>
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

        <BookingForm event={event} upgrades={upgrades} />
      </Container>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Corporate variant
// ---------------------------------------------------------------------------

// Offers — styled like the homepage Services cards. Rendered inside a band.
function CorporateOffers({ data }: { data: EventItem }) {
  const t = useTranslations("eventDetails.corporate")
  const offers = data.offers ?? []

  return (
    <div>
      <SectionHeading title={t("offersTitle")} />
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {offers.map((offer, i) => (
          <div
            key={offer.title}
            className="hover:glow-primary overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-primary"
          >
            <div
              className={cn(
                "h-2 border-b border-border",
                STRIPS[i % STRIPS.length]
              )}
            />
            <div className="flex h-full items-center gap-3.5 bg-card p-[18px] lg:p-6">
              <Image
                src={OFFER_IMAGES[offer.icon] ?? OFFER_IMAGES.drinks}
                alt={offer.title}
                width={84}
                height={84}
                className="size-[74px] shrink-0 object-contain lg:size-[84px]"
              />
              <div>
                <div className="mb-1 font-heading text-xl font-black text-navy lg:text-[22px]">
                  {offer.title}
                </div>
                <p className="text-sm leading-normal font-semibold text-mud lg:text-[15px]">
                  {offer.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// CTA — styled like the homepage Contact section. Rendered full-bleed.
function CorporateCta({ data }: { data: EventItem }) {
  const t = useTranslations("eventDetails.corporate")
  const { branch } = useBranch()

  const contactCards = [
    {
      icon: MessageCircle,
      label: t("whatsappLabel"),
      value: t("whatsappValue"),
      href: whatsappUrl(branch.whatsapp),
    },
    {
      icon: Phone,
      label: t("phoneLabel"),
      value: branch.phone,
      href: `tel:${branch.phone}`,
    },
    {
      icon: Mail,
      label: t("emailLabel"),
      value: "info@bowling.co.il",
      href: "mailto:info@bowling.co.il",
    },
  ]

  return (
    <>
      {/* CTA — styled like the homepage Contact section */}
      <section
        id="book"
        className="mt-12 border-t border-border bg-background py-8 lg:mt-16 lg:py-16"
      >
        <Container>
          <div className="mb-6 text-center lg:mb-9">
            <h2 className="font-heading text-[32px] font-black tracking-[-1px] text-navy lg:text-[46px]">
              {t("ctaTitle")}
            </h2>
            <div className="glow-primary mx-auto mt-3 h-[7px] w-[70px] rounded-full bg-primary lg:w-20" />
            <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-[1.55] font-semibold text-muted-foreground lg:text-[16px]">
              {t("ctaDesc")}
            </p>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:mb-6 lg:gap-4">
            {contactCards.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary lg:p-5"
              >
                <c.icon className="size-5 text-secondary" strokeWidth={2.5} />
                <div className="mt-1.5 font-heading text-[15px] font-extrabold text-navy lg:mt-2 lg:text-base">
                  {c.label}
                </div>
                <div className="text-[13px] font-semibold text-mud lg:text-sm">
                  {c.value}
                </div>
              </a>
            ))}
          </div>

          <BookingForm event={data.title} upgrades={data.extras} />
        </Container>
      </section>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function EventDetailPage({ slug }: { slug: string }) {
  const t = useTranslations("eventDetails")
  const { branch } = useBranch()
  const items = t.raw("items") as Record<string, EventItem>
  const overrides = t.raw("branch") as Record<string, Record<string, EventItem>>
  // Branch-specific content wins over the shared default.
  const data = overrides?.[branch.id]?.[slug] ?? items[slug]
  const isCorporate = slug === "corporate"

  // This event isn't offered at the selected branch.
  if (!branch.events.includes(slug)) {
    return (
      <Container className="py-16 text-center lg:py-24">
        <h1 className="font-heading text-[32px] font-black tracking-[-1px] text-navy lg:text-[44px]">
          {t("notAvailable.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] font-semibold text-mud lg:text-[17px]">
          {t("notAvailable.body")}
        </p>
        <Link
          href="/events"
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
          data={data}
          backLabel={t("backToEvents")}
          bookLabel={t("bookCta")}
        />
      </Container>

      {isCorporate ? (
        <>
          {/* Offers — cream-warm band, like the homepage Gallery */}
          <section className="border-y border-border bg-background py-10 lg:py-14">
            <Container>
              <CorporateOffers data={data} />
            </Container>
          </section>
          <CorporateCta data={data} />
        </>
      ) : (
        <>
          {/* Schedule — rust band */}
          {data.schedule ? (
            <section className="border-y border-border bg-background py-10 lg:py-14">
              <Container>
                <Schedule data={data.schedule} title={t("scheduleTitle")} />
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
            {data.included ? (
              <IncludedSection
                items={data.included}
                title={data.includedTitle ?? t("includedTitle")}
                notes={data.includedNotes}
              />
            ) : null}
            {data.allowed && data.forbidden ? (
              <RulesSection
                allowed={data.allowed}
                forbidden={data.forbidden}
                title={t("rulesTitle")}
                allowedTitle={t("allowedTitle")}
                forbiddenTitle={t("forbiddenTitle")}
                footnote={data.rulesFootnote}
              />
            ) : null}
            {data.extras ? (
              <ExtrasSection
                extras={data.extras}
                title={data.extrasTitle ?? t("extrasTitle")}
                note={data.extrasNote ?? t("extrasNote")}
              />
            ) : null}
          </Container>

          {/* Terms & conditions — continuous document before the booking form */}
          {data.policy ? (
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

          {data.form ? (
            <BookingSection
              event={data.title}
              upgrades={data.extras}
              summary={data.formSummary}
            />
          ) : null}
        </>
      )}
    </>
  )
}
