import { getTranslations } from "next-intl/server"
import { IconChevronLeft } from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"
import { Eyebrow } from "@/components/common/eyebrow"

type Card = {
  href: string
  titleKey:
    | "ServiceCards.menuTitle"
    | "ServiceCards.vouchersTitle"
    | "ServiceCards.birthdaysTitle"
  descKey:
    | "ServiceCards.menuDesc"
    | "ServiceCards.vouchersDesc"
    | "ServiceCards.birthdaysDesc"
  badge: string
  tone: "red" | "turq" | "yellow"
}

const CARDS: Card[] = [
  {
    href: "/menu",
    titleKey: "ServiceCards.menuTitle",
    descKey: "ServiceCards.menuDesc",
    badge: "01",
    tone: "red",
  },
  {
    href: "/vouchers",
    titleKey: "ServiceCards.vouchersTitle",
    descKey: "ServiceCards.vouchersDesc",
    badge: "02",
    tone: "turq",
  },
  {
    href: "/birthdays",
    titleKey: "ServiceCards.birthdaysTitle",
    descKey: "ServiceCards.birthdaysDesc",
    badge: "03",
    tone: "yellow",
  },
]

const toneClass: Record<Card["tone"], string> = {
  red: "bg-red text-white",
  turq: "bg-turq text-white",
  yellow: "bg-yellow text-ink",
}

export async function ServiceCards() {
  const t = await getTranslations()

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 text-center">
          <Eyebrow tone="red">{t("ServiceCards.eyebrow")}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl leading-[1] text-ink sm:text-3xl">
            {t("ServiceCards.title")}
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center gap-3 border-2 border-ink bg-paper px-3 py-3 shadow-block transition-transform duration-100 active:translate-y-[3px] active:[box-shadow:0_1px_0_var(--ink)]"
            >
              <div
                className={`grid size-12 shrink-0 place-items-center border-2 border-ink font-display text-lg ${toneClass[c.tone]}`}
              >
                {c.badge}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-extrabold text-ink">
                  {t(c.titleKey)}
                </div>
                <div className="truncate text-sm text-ink/70">
                  {t(c.descKey)}
                </div>
              </div>
              <IconChevronLeft
                className="size-4 shrink-0 text-ink rtl:-scale-x-100"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
