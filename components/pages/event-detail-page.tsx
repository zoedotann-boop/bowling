"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Mail, MessageCircle, Phone, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "@/components/home/container"

// Illustrated sticker icons for the schedule steps and corporate offers.
const STEP_IMAGES: Record<string, string> = {
  arrival: "/events/steps/arrival.png",
  bowling: "/events/steps/bowling.png",
  table: "/events/steps/table.png",
  cake: "/events/steps/cake.png",
  gym: "/events/steps/gym.png",
  meal: "/events/steps/meal.png",
}

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

// "מה הלו״ז?" — styled like the homepage FeatureStrip (dotted cards + round icon).
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
        {data.steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-sm border border-border bg-card p-4 lg:p-[22px]"
          >
            <div className="flex items-center justify-between">
              <div className="size-14 overflow-hidden rounded-full border border-border bg-background lg:size-[60px]">
                <Image
                  src={STEP_IMAGES[step.icon] ?? STEP_IMAGES.arrival}
                  alt={step.title}
                  width={60}
                  height={60}
                  className="size-full object-cover"
                />
              </div>
              <span className="glow-primary flex size-6 items-center justify-center rounded-full bg-primary font-heading text-[12px] font-black text-primary-foreground">
                {i + 1}
              </span>
            </div>
            <div className="mt-3 font-heading text-base font-extrabold text-navy lg:text-[19px]">
              {step.title}
            </div>
            <div className="mt-1 text-[13px] font-semibold text-mud lg:text-sm">
              {step.desc}
            </div>
          </div>
        ))}
      </div>
      {data.footnote ? (
        <p className="mt-4 text-[13px] font-semibold text-muted-foreground">
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
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "relative overflow-hidden rounded-sm border p-6 lg:p-7",
              card.tag
                ? "glow-primary border-primary bg-card"
                : "border-border bg-card"
            )}
          >
            {card.tag ? (
              <span className="absolute end-5 top-5 rounded-sm border border-primary bg-primary px-3 py-0.5 font-heading text-[11px] font-extrabold text-primary-foreground">
                {card.tag}
              </span>
            ) : null}
            <div
              className={cn(
                "font-mono text-[12.5px] font-bold",
                card.tag ? "text-secondary" : "text-mud"
              )}
            >
              {card.sub}
            </div>
            <div
              className={cn(
                "mt-0.5 font-heading text-[19px] font-black",
                card.tag ? "text-foreground" : "text-navy"
              )}
            >
              {card.label}
            </div>
            <div
              className={cn(
                "mt-4 font-heading text-[44px] leading-none font-black",
                card.tag ? "text-primary" : "text-rust"
              )}
            >
              {card.price}
            </div>
            <div
              className={cn(
                "mt-2 text-[12.5px] font-semibold",
                card.tag ? "text-muted-foreground" : "text-mud"
              )}
            >
              {card.note}
            </div>
            {card.note2 ? (
              <div
                className={cn(
                  "mt-1.5 inline-block rounded-sm border px-2.5 py-0.5 font-heading text-[12px] font-extrabold",
                  card.tag
                    ? "border-secondary text-secondary"
                    : "border-primary bg-primary text-primary-foreground"
                )}
              >
                {card.note2}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

// "מה כלול" — styled like the homepage Pricing table (navy rows, alternating bg).
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
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        {items.map((item, i) => (
          <div
            key={item}
            className={cn(
              "flex items-center gap-3 border-b border-border px-5 py-4 last:border-b-0 lg:px-6",
              i % 2 ? "bg-background" : "bg-card"
            )}
          >
            <span className="flex size-6 flex-none items-center justify-center rounded-full border border-secondary bg-secondary">
              <Check
                className="size-3 text-secondary-foreground"
                strokeWidth={3}
              />
            </span>
            <span className="text-[15px] font-semibold text-foreground">
              {item}
            </span>
          </div>
        ))}
      </div>
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

// "מותר ואסור" — styled like the homepage Services cards (colored top strip).
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
    <div className="overflow-hidden rounded-sm border border-border bg-card">
      <div
        className={cn(
          "h-2 border-b border-border",
          ok ? "bg-secondary" : "bg-red"
        )}
      />
      <div className="bg-card p-5 lg:p-6">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full border",
              ok ? "border-secondary bg-secondary" : "border-red bg-red"
            )}
          >
            {ok ? (
              <Check
                className="size-4 text-secondary-foreground"
                strokeWidth={3}
              />
            ) : (
              <X className="size-4 text-foreground" strokeWidth={3} />
            )}
          </span>
          <span className="font-heading text-[18px] font-black text-navy">
            {heading}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              {ok ? (
                <Check
                  className="size-4 flex-none text-secondary"
                  strokeWidth={3}
                />
              ) : (
                <X className="size-4 flex-none text-red" strokeWidth={3} />
              )}
              <span className="text-[14.5px] font-semibold text-foreground">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <RuleCard heading={allowedTitle} items={allowed} ok />
        <RuleCard heading={forbiddenTitle} items={forbidden} ok={false} />
      </div>
      {footnote ? (
        <p className="mt-4 text-[13px] font-semibold text-mud">{footnote}</p>
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

// "מדיניות הזמנה" — styled like the homepage Pricing table (navy rows).
function PolicySection({
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
    <div>
      <SectionHeading title={title} note={note} />
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        {rows.map((row, i) => (
          <div
            key={row.title}
            className={cn(
              "border-b border-border px-5 py-4 last:border-b-0 lg:px-6",
              i % 2 ? "bg-background" : "bg-card"
            )}
          >
            <div className="font-heading text-[15px] font-black text-navy">
              {row.title}
            </div>
            <p className="mt-1 text-[13.5px] leading-relaxed font-semibold text-mud">
              {row.desc}
            </p>
          </div>
        ))}
      </div>
      {footnote ? (
        <p className="mt-4 text-[13px] font-semibold text-mud">{footnote}</p>
      ) : null}
    </div>
  )
}

// Booking form — styled like the homepage Contact section (teal + dashed card).
function BookingForm({
  form,
  summary,
}: {
  form: FormConfig
  summary?: FormSummary
}) {
  const t = useTranslations("eventDetails.form")
  const te = useTranslations("eventDetails")
  const [agreed, setAgreed] = useState(false)

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

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto flex max-w-3xl flex-col gap-3.5 rounded-sm border border-primary bg-card p-[22px] lg:p-8"
        >
          <div className="grid gap-3.5 sm:grid-cols-2">
            <input className={inputClass} placeholder={t("namePlaceholder")} />
            <input
              type="tel"
              className={inputClass}
              placeholder={t("phonePlaceholder")}
            />
            <input className={inputClass} placeholder={t("datePlaceholder")} />
            <input className={inputClass} placeholder={form.countPlaceholder} />
            {form.celebrant ? (
              <>
                <input
                  className={inputClass}
                  placeholder={t("celebrantNamePlaceholder")}
                />
                <input
                  className={inputClass}
                  placeholder={t("celebrantAgePlaceholder")}
                />
              </>
            ) : null}
          </div>

          {form.policyCheckbox ? (
            <label className="flex items-center gap-2.5 text-[13px] font-bold text-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="size-4 accent-primary"
              />
              {t("policyAgree")}
            </label>
          ) : null}

          <button
            type="submit"
            className="glow-primary mt-1 w-full rounded-sm border border-primary bg-primary px-5 py-3.5 font-heading text-[17px] font-black text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:py-4 lg:text-lg"
          >
            {t("submit")}
          </button>
          <p className="text-center text-[12px] font-medium text-mud">
            {t("footnote")}
          </p>
        </form>
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
function CorporateCta() {
  const t = useTranslations("eventDetails.corporate")
  const tf = useTranslations("eventDetails.corporate.form")
  const { branch } = useBranch()

  const contactCards = [
    {
      icon: MessageCircle,
      label: t("whatsappLabel"),
      value: t("whatsappValue"),
      href: whatsappUrl(),
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

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto flex max-w-3xl flex-col gap-3.5 rounded-sm border border-primary bg-card p-[22px] lg:p-8"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder={tf("namePlaceholder")}
              />
              <input
                type="tel"
                className={inputClass}
                placeholder={tf("phonePlaceholder")}
              />
              <input
                className={inputClass}
                placeholder={tf("datePlaceholder")}
              />
              <input
                className={inputClass}
                placeholder={tf("countPlaceholder")}
              />
            </div>
            <textarea
              className={cn(inputClass, "h-24 w-full resize-none")}
              placeholder={tf("notesPlaceholder")}
            />
            <button
              type="submit"
              className="glow-primary mt-1 w-full rounded-sm border border-primary bg-primary px-5 py-3.5 font-heading text-[17px] font-black text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:py-4 lg:text-lg"
            >
              {tf("submit")}
            </button>
          </form>
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
          <CorporateCta />
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

          {/* Policy — cream-warm band before the teal booking form */}
          {data.policy ? (
            <section className="border-t border-border bg-background py-10 lg:py-14">
              <Container>
                <PolicySection
                  rows={data.policy}
                  title={t("policyTitle")}
                  note={t("policyNote")}
                  footnote={data.policyFootnote}
                />
              </Container>
            </section>
          ) : null}

          {data.form ? (
            <BookingForm form={data.form} summary={data.formSummary} />
          ) : null}
        </>
      )}
    </>
  )
}
