import Link from "next/link"
import { Cake, Check, Megaphone, PartyPopper, Sparkles, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "@/components/home/container"

const ICONS: Record<string, typeof Cake> = {
  birthdays: Cake,
  gymboree: PartyPopper,
  "no-room": Sparkles,
  team: Users,
  corporate: Megaphone,
}

const ACCENTS = ["bg-marigold", "bg-cyan", "bg-pink", "bg-teal", "bg-rust"]

export function EventsPage() {
  const t = useTranslations("eventsPage")
  const cards = t.raw("cards") as { id: string; title: string; desc: string }[]
  const included = t.raw("included.items") as string[]

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-orange lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="mt-1.5 font-heading text-[40px] font-black leading-none tracking-[-1.5px] text-navy lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] font-semibold text-mud lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      {/* Event type cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = ICONS[c.id] ?? Sparkles
          return (
            <Link
              key={c.id}
              href="/contact"
              className="group flex flex-col overflow-hidden rounded-[20px] border-[4px] border-navy bg-paper transition-transform hover:-translate-y-1"
            >
              <div className={cn("h-2 border-b-[4px] border-navy", ACCENTS[i])} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex size-12 items-center justify-center rounded-xl border-[3px] border-navy bg-cream-warm">
                  <Icon className="size-6 text-navy" strokeWidth={2.25} />
                </div>
                <div className="mt-4 font-heading text-[22px] font-black text-navy">
                  {c.title}
                </div>
                <p className="mt-2 flex-1 text-sm font-semibold leading-relaxed text-mud">
                  {c.desc}
                </p>
                <span className="mt-4 font-heading text-sm font-extrabold text-red">
                  {t("cardCta")} ←
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* What's included */}
      <div className="mt-8 rounded-[24px] border-[4px] border-dotted border-navy p-6 lg:mt-12 lg:p-8">
        <h2 className="font-heading text-[24px] font-black tracking-[-0.5px] text-navy lg:text-[30px]">
          {t("included.title")}
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {included.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="flex size-7 flex-none items-center justify-center rounded-full border-[3px] border-navy bg-mint">
                <Check className="size-3.5 text-navy" strokeWidth={3} />
              </span>
              <span className="text-[15px] font-semibold text-navy">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 overflow-hidden rounded-[24px] border-[5px] border-navy bg-rust p-7 lg:mt-8 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-11">
        <div>
          <h2 className="font-heading text-[28px] font-black tracking-[-1px] text-paper lg:text-[38px]">
            {t("cta.title")}
          </h2>
          <p className="mt-2 max-w-[440px] text-[15px] font-semibold leading-[1.55] text-[#ffe3e0] lg:text-[17px]">
            {t("cta.desc")}
          </p>
        </div>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-full border-[3px] border-navy bg-paper px-7 py-3.5 text-center font-heading text-[15px] font-extrabold text-navy transition-colors hover:bg-marigold lg:mt-0 lg:flex-none lg:text-base"
        >
          {t("cta.button")} ←
        </Link>
      </div>
    </Container>
  )
}
