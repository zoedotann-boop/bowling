"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { Container } from "@/components/home/container"

const ICONS: Record<string, string> = {
  birthdays: "/events/birthdays.png",
  gymboree: "/events/gymboree.png",
  "no-room": "/events/no-room.png",
  team: "/events/team.png",
  corporate: "/events/corporate.png",
}

// Top-strip accent colors — neon light strips alternating purple/cyan.
const STRIPS = [
  "bg-primary",
  "bg-secondary",
  "bg-primary",
  "bg-secondary",
  "bg-primary",
]

export function EventsPage() {
  const t = useTranslations("eventsPage")
  const { branch } = useBranch()
  const allCards = t.raw("cards") as {
    id: string
    title: string
    desc: string
  }[]
  const cardById = new Map(allCards.map((c) => [c.id, c]))

  // Only the events this branch offers, in branch order. Rishon's birthday
  // card uses the "deal" title.
  const cards = branch.events
    .map((id) => cardById.get(id))
    .filter((c): c is { id: string; title: string; desc: string } => Boolean(c))
    .map((c) =>
      branch.id === "rishon" && c.id === "birthdays"
        ? { ...c, title: t("dealTitle") }
        : c
    )

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] font-semibold text-mud lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      {/* Event type cards — styled exactly like the home "Services" cards */}
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {cards.map((c, i) => (
          <Link
            key={c.id}
            href={`/events/${c.id}`}
            className="hover:glow-primary block overflow-hidden rounded-sm border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary"
          >
            <div
              className={cn(
                "h-2 border-b border-border",
                STRIPS[i % STRIPS.length]
              )}
            />
            <div className="flex h-full items-center gap-3.5 bg-card p-[18px] lg:p-6">
              <Image
                src={ICONS[c.id] ?? ICONS.birthdays}
                alt={c.title}
                width={84}
                height={84}
                className="size-[74px] shrink-0 object-contain lg:size-[84px]"
              />
              <div>
                <div className="mb-1 font-heading text-xl font-black text-navy lg:text-[22px]">
                  {c.title}
                </div>
                <p className="mb-1.5 text-sm leading-normal font-semibold text-mud lg:text-[15px]">
                  {c.desc}
                </p>
                <span className="cursor-pointer font-heading text-sm font-extrabold text-red lg:text-[15px]">
                  {t("cardCta")} ←
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card p-7 lg:mt-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-11">
        <div>
          <h2 className="font-heading text-[28px] font-black tracking-[-1px] text-navy lg:text-[38px]">
            {t("cta.title")}
          </h2>
          <p className="mt-2 max-w-[440px] text-[15px] leading-[1.55] font-semibold text-muted-foreground lg:text-[17px]">
            {t("cta.desc")}
          </p>
        </div>
        <a
          href={whatsappUrl(branch.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="glow-primary mt-5 inline-block rounded-sm border border-primary bg-primary px-7 py-3.5 text-center font-heading text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground lg:mt-0 lg:flex-none lg:text-base"
        >
          {t("cta.button")} ←
        </a>
      </div>
    </Container>
  )
}
