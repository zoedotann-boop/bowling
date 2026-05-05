"use client"

import * as React from "react"
import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  IconCheck,
  IconChevronLeft,
  IconLanguage,
  IconMapPin,
  IconMenu2,
  IconWorld,
} from "@tabler/icons-react"

import { Link, usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { selectBranch } from "@/app/[locale]/(site)/_actions/branch"
import type { BranchOption } from "@/lib/site-branch"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { BowlingLogo } from "@/components/brand/bowling-logo"

const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  he: "עברית",
  ar: "العربية",
}

const localeShort: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  he: "HE",
  ar: "AR",
}

type NavLink = {
  href: string
  labelKey: "Nav.home" | "Nav.birthdays" | "Nav.menu" | "Nav.vouchers"
}

const NAV_LINKS: NavLink[] = [
  { href: "/", labelKey: "Nav.home" },
  { href: "/birthdays", labelKey: "Nav.birthdays" },
  { href: "/menu", labelKey: "Nav.menu" },
  { href: "/vouchers", labelKey: "Nav.vouchers" },
]

export function SiteMenu({
  branches,
  currentSlug,
  city,
}: {
  branches: BranchOption[]
  currentSlug: string
  city: string
}) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label={t("Nav.menuLabel")}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-lg border-2 border-ink bg-paper text-ink shadow-block-sm transition active:translate-x-[1px] active:translate-y-[1px]"
      >
        <IconMenu2 className="size-5" aria-hidden />
      </button>
      <SheetContent
        side="right"
        className="overflow-y-auto rtl:data-[side=right]:right-auto rtl:data-[side=right]:left-0 rtl:data-[side=right]:border-s-0 rtl:data-[side=right]:border-e-2"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <BowlingLogo city={city} size="xs" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 p-4">
          {branches.length > 1 ? (
            <BranchSection
              branches={branches}
              currentSlug={currentSlug}
              onAfter={() => setOpen(false)}
            />
          ) : null}

          <NavSection onAfter={() => setOpen(false)} />

          <LocaleSection onAfter={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function BranchSection({
  branches,
  currentSlug,
  onAfter,
}: {
  branches: BranchOption[]
  currentSlug: string
  onAfter: () => void
}) {
  const t = useTranslations("BranchSwitcher")
  const [pending, startTransition] = useTransition()

  function pick(slug: string) {
    if (pending) return
    startTransition(async () => {
      if (slug !== currentSlug) {
        await selectBranch(slug)
      }
      onAfter()
    })
  }

  return (
    <section>
      <SectionLabel icon={<IconMapPin className="size-3.5" aria-hidden />}>
        {t("title")}
      </SectionLabel>
      <ul className="mt-3 flex flex-col gap-2">
        {branches.map((b) => {
          const active = b.slug === currentSlug
          return (
            <li key={b.slug}>
              <button
                type="button"
                onClick={() => pick(b.slug)}
                disabled={pending}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 border-ink px-3 py-2.5 text-start transition active:translate-x-[1px] active:translate-y-[1px] ${
                  active
                    ? "bg-ink text-cream shadow-block-sm"
                    : "bg-paper text-ink shadow-block-sm hover:bg-cream"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold">
                    {b.shortName}
                  </div>
                  {b.city ? (
                    <div className="truncate font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
                      {b.city}
                    </div>
                  ) : null}
                </div>
                {active ? (
                  <IconCheck className="size-4 shrink-0" aria-hidden />
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function NavSection({ onAfter }: { onAfter: () => void }) {
  const t = useTranslations()
  return (
    <section>
      <SectionLabel icon={<IconWorld className="size-3.5" aria-hidden />}>
        {t("Nav.exploreLabel")}
      </SectionLabel>
      <ul className="mt-3 flex flex-col gap-1">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onAfter}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-bold text-ink transition hover:bg-cream"
            >
              <span>{t(link.labelKey)}</span>
              <IconChevronLeft
                className="size-4 text-ink/60 rtl:-scale-x-100"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function LocaleSection({ onAfter }: { onAfter: () => void }) {
  const t = useTranslations("LocaleSwitcher")
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  return (
    <section>
      <SectionLabel icon={<IconLanguage className="size-3.5" aria-hidden />}>
        {t("title")}
      </SectionLabel>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {routing.locales.map((l) => {
          const active = l === locale
          return (
            <li key={l}>
              <button
                type="button"
                onClick={() => {
                  router.replace(pathname, { locale: l })
                  onAfter()
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border-2 border-ink px-3 py-2.5 text-start transition active:translate-x-[1px] active:translate-y-[1px] ${
                  active
                    ? "bg-ink text-cream shadow-block-sm"
                    : "bg-paper text-ink shadow-block-sm hover:bg-cream"
                }`}
              >
                <span className="text-sm font-bold">{localeLabels[l]}</span>
                <span className="font-mono text-[10px] tracking-[0.18em] opacity-70">
                  {localeShort[l]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SectionLabel({
  children,
  icon,
}: {
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.22em] text-red uppercase">
      {icon}
      {children}
    </div>
  )
}
