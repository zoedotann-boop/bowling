import { getLocale, getTranslations } from "next-intl/server"
import { IconMenu2, IconBrandWhatsapp } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { BranchSwitcher } from "./branch-switcher"
import { LocaleSwitcher } from "./locale-switcher"

export async function SiteHeader({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const navItems: {
    href: "/" | "/prices" | "/events" | "/contact"
    label: string
  }[] = [
    { href: "/", label: t("Nav.home") },
    { href: "/prices", label: t("Nav.prices") },
    { href: "/events", label: t("Nav.events") },
    { href: "/contact", label: t("Nav.contact") },
  ]
  const city = branch.city[locale]
  const waHref = buildWhatsAppLink(
    branch,
    wa("prefilled", { branch: branch.displayName[locale] })
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-18 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`Bowling ${city}`} className="shrink-0">
          <BowlingLogo city={city} size="xs" />
        </Link>

        <nav
          className="ms-8 hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Button
              key={item.href}
              render={<Link href={item.href} />}
              variant="ghost"
              size="sm"
              className="rounded-full px-3 text-sm font-medium text-ink-soft hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:flex sm:items-center sm:gap-1.5">
            <LocaleSwitcher />
            <BranchSwitcher currentSlug={branch.slug} />
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="hidden h-10 items-center gap-2 rounded-full bg-whatsapp px-4 text-sm font-medium text-white shadow-soft transition hover:bg-whatsapp-hover sm:inline-flex"
          >
            <IconBrandWhatsapp className="size-4" aria-hidden />
            {t("Cta.book")}
          </a>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-10 rounded-full text-ink hover:bg-surface-muted md:hidden"
                  aria-label={t("Nav.menuLabel")}
                />
              }
            >
              <IconMenu2 className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 border-s border-line bg-canvas"
            >
              <SheetHeader className="border-b border-line">
                <SheetTitle>
                  <BowlingLogo city={city} size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col" aria-label="Mobile">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    render={<Link href={item.href} />}
                    variant="ghost"
                    className="h-12 justify-start rounded-none border-b border-line px-6 text-base font-medium"
                  >
                    {item.label}
                  </Button>
                ))}
                <div className="mt-4 flex items-center gap-2 px-6">
                  <LocaleSwitcher />
                  <BranchSwitcher currentSlug={branch.slug} />
                </div>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener"
                  className="mx-6 mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-white shadow-soft transition hover:bg-whatsapp-hover"
                >
                  <IconBrandWhatsapp className="size-5" aria-hidden />
                  {t("Cta.book")}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
