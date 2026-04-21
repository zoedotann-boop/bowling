import { getTranslations } from "next-intl/server"
import { IconChevronLeft } from "@tabler/icons-react"
import { Link } from "@/i18n/navigation"
import { Eyebrow } from "@/components/common/eyebrow"

type Row = {
  k: string
  href: string
  titleKey: "Cta.book" | "Nav.prices" | "Nav.events" | "EventsTeaser.title"
  subKey:
    | "Hero.scrollHint"
    | "PricingPreview.subtitle"
    | "Events.intro"
    | "EventsTeaser.subtitle"
  tone: "red" | "turq" | "yellow" | "red-2"
}

const rows: Row[] = [
  {
    k: "01",
    href: "/",
    titleKey: "Cta.book",
    subKey: "Hero.scrollHint",
    tone: "red",
  },
  {
    k: "02",
    href: "/prices",
    titleKey: "Nav.prices",
    subKey: "PricingPreview.subtitle",
    tone: "turq",
  },
  {
    k: "03",
    href: "/events",
    titleKey: "Nav.events",
    subKey: "Events.intro",
    tone: "yellow",
  },
  {
    k: "04",
    href: "/events",
    titleKey: "EventsTeaser.title",
    subKey: "EventsTeaser.subtitle",
    tone: "red-2",
  },
]

const toneClass: Record<Row["tone"], string> = {
  red: "bg-red text-white",
  turq: "bg-turq text-white",
  yellow: "bg-yellow text-ink",
  "red-2": "bg-red-2 text-white",
}

export async function QuickActions() {
  const t = await getTranslations()

  return (
    <section className="relative bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 text-center">
          <Eyebrow tone="red">{t("Nav.menuLabel")}</Eyebrow>
          <h2 className="mt-2 font-display text-2xl leading-[1] text-ink sm:text-3xl">
            {t("Highlights.subtitle")}
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <Link
              key={r.k}
              href={r.href}
              className="flex items-center gap-3 border-2 border-ink bg-paper px-3 py-2.5 shadow-block transition-transform duration-100 active:translate-y-[3px] active:[box-shadow:0_1px_0_var(--ink)]"
            >
              <div
                className={`grid size-11 shrink-0 place-items-center border-2 border-ink font-display text-lg ${toneClass[r.tone]}`}
              >
                {r.k}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-extrabold text-ink">
                  {t(r.titleKey)}
                </div>
                <div className="truncate text-sm text-ink/70">
                  {t(r.subKey)}
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
