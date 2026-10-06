"use client"

import type { ComponentType, SVGProps } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Info, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { branchPath, type BranchId } from "@/lib/branches"
import type { SiteEventLocation } from "@/lib/db/queries/site"
import type { BookingFormField } from "@/lib/events/fields"
import { usesContactForm } from "@/lib/events/slugs"
import { isOptimizableImage } from "@/lib/images"
import { formatPrice, pickLocale } from "@/lib/localized"
import { useBranch } from "@/components/branch-context"
import { BookingPanel, UpgradeList } from "@/components/booking-form"
import {
  BirthdaysIllustration,
  CorporateIllustration,
  GymboreeIllustration,
  NoRoomIllustration,
  TeamIllustration,
} from "@/components/illustrations"
import { Contact } from "@/components/home/contact"
import { Container } from "@/components/home/container"
import {
  useEventDetail,
  type EventItem,
  type Extra,
  type PolicyRow,
  type PriceOption,
} from "@/hooks/use-event-detail"

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

interface PriceCard {
  tag?: string
  sub?: string
  label: string
  price?: string
  note?: string
  note2?: string
}

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
            {card.price ? (
              <div className="mt-4 font-heading text-[44px] leading-none font-black text-primary">
                {card.price}
              </div>
            ) : null}
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
  deskNote,
}: {
  extras: Extra[]
  title: string
  note: string
  deskNote: string
}) {
  return (
    <div>
      <SectionHeading title={title} note={note} />
      <p
        role="note"
        className="mb-4 flex items-start gap-2.5 rounded-sm border-s-4 border-primary bg-primary/10 px-4 py-3 font-heading text-[15px] leading-snug font-extrabold text-navy lg:text-base"
      >
        <Info
          aria-hidden
          className="mt-0.5 size-4.5 shrink-0 text-primary"
          strokeWidth={2.5}
        />
        {deskNote}
      </p>
      <UpgradeList upgrades={extras} />
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

function BookingSection({
  intro,
  children,
}: {
  intro: string
  children: React.ReactNode
}) {
  const t = useTranslations("eventDetails.form")

  return (
    <section
      id="book"
      className="mt-10 border-t border-border bg-background py-8 lg:mt-16 lg:py-12"
    >
      <Container>
        <div className="mb-5 text-center lg:mb-7">
          <h2 className="font-heading text-[26px] font-black tracking-[-1px] text-navy lg:text-[38px]">
            {t("title")}
          </h2>
          <div className="glow-primary mx-auto mt-2.5 h-[6px] w-[60px] rounded-full bg-primary lg:w-20" />
          {intro ? (
            <p className="mx-auto mt-2.5 max-w-[520px] text-[14px] leading-[1.5] font-semibold text-muted-foreground lg:text-[15px]">
              {intro}
            </p>
          ) : null}
        </div>
        {children}
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
  const {
    available,
    content,
    messageData,
    data,
    priceOptions,
    priceNote,
    booking,
  } = useEventDetail({
    branch,
    slug,
    eventTypes: events[branch.id]?.eventTypes ?? [],
    defaultFormFields,
  })
  const money = (amount: number) => formatPrice(amount, locale)
  const priceCard = ({
    badge,
    days,
    label,
    amount,
    childrenCount,
    extraChildAmount,
  }: PriceOption): PriceCard => ({
    tag: badge || undefined,
    sub: days || undefined,
    label,
    price: amount != null ? money(amount) : undefined,
    note: childrenCount
      ? t("package.upTo", { count: childrenCount })
      : undefined,
    note2:
      extraChildAmount == null
        ? undefined
        : childrenCount
          ? t("package.extraOver", {
              count: childrenCount,
              price: money(extraChildAmount),
            })
          : t("package.extra", { price: money(extraChildAmount) }),
  })

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
        {priceOptions.length ? (
          <PriceSection
            cards={priceOptions.map(priceCard)}
            title={t("priceTitle")}
            note={priceNote || undefined}
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
            deskNote={t("extrasDeskNote")}
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
      ) : booking ? (
        <BookingSection intro={booking.intro}>
          <BookingPanel booking={booking} />
        </BookingSection>
      ) : null}
    </>
  )
}
