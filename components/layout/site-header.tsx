import { getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { BranchOption, SiteBranch } from "@/lib/site-branch"
import { Link } from "@/i18n/navigation"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { LocaleSwitcher } from "./locale-switcher"
import { BranchSwitcher } from "./branch-switcher"

export async function SiteHeader({
  branch,
  branches,
}: {
  branch: SiteBranch
  branches: BranchOption[]
}) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const waHref = buildWhatsAppLink(
    branch,
    wa("prefilled", { branch: branch.displayName })
  )

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`Bowling ${branch.city}`}
          className="shrink-0"
        >
          <BowlingLogo city={branch.city} size="xs" />
        </Link>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <BranchSwitcher branches={branches} currentSlug={branch.slug} />
          <LocaleSwitcher />
          <a
            href={waHref}
            target="_blank"
            rel="noopener"
            className="hidden h-11 items-center gap-2 rounded-lg border-2 border-ink bg-whatsapp px-4 text-sm font-bold text-white shadow-block-sm transition hover:bg-whatsapp-hover active:translate-x-[1px] active:translate-y-[1px] sm:inline-flex"
          >
            <IconBrandWhatsapp className="size-4" aria-hidden />
            {t("Cta.book")}
          </a>
        </div>
      </div>
    </header>
  )
}
