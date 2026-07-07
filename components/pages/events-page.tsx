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

// Top-strip accent colors, matching the home "Services" cards.
const STRIPS = ["bg-orange", "bg-gold", "bg-teal", "bg-cyan", "bg-rust"]

export function EventsPage() {
  const t = useTranslations("eventsPage")
  const { branch } = useBranch()
  const allCards = t.raw("cards") as { id: string; title: string; desc: string }[]
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
        <span className="font-mono text-[13px] font-bold text-orange lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] text-navy lg:text-[56px]">
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
            className="block overflow-hidden rounded-[18px] border-[4px] border-navy bg-paper transition-transform hover:-translate-y-0.5 lg:rounded-[20px]"
          >
            <div
              className={cn(
                "h-2 border-b-[4px] border-navy",
                STRIPS[i % STRIPS.length]
              )}
            />
            <div className="flex h-full items-center gap-3.5 bg-cream-warm p-[18px] lg:p-6">
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
      <div className="mt-6 overflow-hidden rounded-[24px] bg-rust p-7 shadow-sm lg:mt-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-11">
        <div>
          <h2 className="font-heading text-[28px] font-black tracking-[-1px] text-paper lg:text-[38px]">
            {t("cta.title")}
          </h2>
          <p className="mt-2 max-w-[440px] text-[15px] leading-[1.55] font-semibold text-[#ffe3e0] lg:text-[17px]">
            {t("cta.desc")}
          </p>
        </div>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full border-[3px] border-navy bg-paper px-7 py-3.5 text-center font-heading text-[15px] font-extrabold text-navy transition-colors hover:bg-marigold lg:mt-0 lg:flex-none lg:text-base"
        >
          {t("cta.button")} ←
        </a>
      </div>
    </Container>
  )
}
