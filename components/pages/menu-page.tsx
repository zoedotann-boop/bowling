"use client"

import { useEffect, useRef } from "react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import type { BranchId } from "@/lib/branches"
import type { SiteMenu } from "@/lib/db/queries/site"
import { formatPrice, pickLocale } from "@/lib/localized"
import { displayPrices, type DisplayPrice } from "@/lib/menu"
import { useBranch } from "@/components/branch-context"
import { Container } from "@/components/home/container"
import { useActiveSection } from "@/hooks/use-active-section"

type Category<Price> = {
  id: string
  label: string
  items: { name: string; prices: Price[]; desc: string }[]
}
type MessagePrice = { label?: string; amount: number }

export function MenuPage({
  menus,
}: {
  menus: Partial<Record<BranchId, SiteMenu>>
}) {
  const t = useTranslations("menuPage")
  const locale = useLocale() as "he" | "en"
  const { branchId } = useBranch()
  const dbMenu = menus[branchId]

  const categories: Category<DisplayPrice>[] = dbMenu
    ? dbMenu.menuCategories
        .filter((c) => c.items.length > 0)
        .map((c) => ({
          id: c.id,
          label: pickLocale(c.label, locale),
          items: c.items.map((item) => ({
            name: pickLocale(item.name, locale),
            prices: displayPrices(item.prices, locale),
            desc: pickLocale(item.description, locale),
          })),
        }))
    : (t.raw("categories") as Category<MessagePrice>[]).map((c) => ({
        ...c,
        items: c.items.map((item) => ({
          ...item,
          prices: item.prices.map(({ label = "", amount }) => ({
            label,
            price: formatPrice(amount, locale),
          })),
        })),
      }))
  const heading = pickLocale(dbMenu?.menu?.heading, locale) || t("title")
  const intro = pickLocale(dbMenu?.menu?.intro, locale) || t("subtitle")

  const [active, setActive] = useActiveSection(
    categories.map((c) => sectionId(c.id))
  )
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const strip = stripRef.current
    const link = strip?.querySelector("[aria-current]")
    if (!strip || !link) return
    const s = strip.getBoundingClientRect()
    const l = link.getBoundingClientRect()
    strip.scrollBy({
      left: l.left + l.width / 2 - (s.left + s.width / 2),
      behavior: "smooth",
    })
  }, [active])

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
          {heading}
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-mud lg:text-lg">
          {intro}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <nav
          aria-label={t("categoriesNav")}
          className="sticky top-0 z-10 -mx-5 bg-background px-5 py-3 lg:top-6 lg:mx-0 lg:w-52 lg:flex-none lg:self-start lg:bg-transparent lg:p-0"
        >
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-visible"
          >
            {categories.map((c) => {
              const id = sectionId(c.id)
              return (
                <a
                  key={c.id}
                  href={`#${id}`}
                  onClick={() => setActive(id)}
                  aria-current={active === id ? "location" : undefined}
                  className={cn(
                    "shrink-0 rounded-sm border px-4 py-2 font-heading text-[13px] font-extrabold transition-colors lg:text-start lg:text-sm",
                    active === id
                      ? "glow-primary border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {c.label}
                </a>
              )
            })}
          </div>
        </nav>

        <div className="flex flex-1 flex-col gap-10 lg:gap-12">
          {categories.map((c) => (
            <section
              key={c.id}
              id={sectionId(c.id)}
              aria-labelledby={`${sectionId(c.id)}-title`}
              className="scroll-mt-20 lg:scroll-mt-6"
            >
              <h2
                id={`${sectionId(c.id)}-title`}
                className="mb-4 font-heading text-2xl font-black text-navy lg:text-[28px]"
              >
                {c.label}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {c.items.map((item, i) => (
                  <MenuItemCard key={i} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <p className="mt-8 text-[12.5px] font-medium text-faint">{t("note")}</p>
    </Container>
  )
}

function sectionId(categoryId: string) {
  return `menu-${categoryId}`
}

function MenuItemCard({
  item,
}: {
  item: Category<DisplayPrice>["items"][number]
}) {
  const [single] = item.prices
  const inline = item.prices.length === 1 && !single.label
  return (
    <div className="rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary">
      <div className="flex items-start justify-between gap-3">
        <div className="font-heading text-[15px] font-black text-navy lg:text-base">
          {item.name}
        </div>
        {inline && (
          <div className="shrink-0 font-heading text-[15px] font-black whitespace-nowrap text-rust lg:text-base">
            {single.price}
          </div>
        )}
      </div>
      {item.desc && (
        <div className="mt-1.5 text-[12.5px] leading-snug font-semibold text-mud">
          {item.desc}
        </div>
      )}
      {!inline && item.prices.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {item.prices.map((p, j) => (
            <li key={j} className="flex items-baseline gap-1.5">
              {p.label && (
                <span className="text-[12.5px] font-semibold text-mud">
                  {p.label}
                </span>
              )}
              <span className="font-heading text-[15px] font-black whitespace-nowrap text-rust lg:text-base">
                {p.price}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
