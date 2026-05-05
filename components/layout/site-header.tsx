import type { BranchOption, SiteBranch } from "@/lib/site-branch"
import { Link } from "@/i18n/navigation"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { SiteMenu } from "./site-menu"

export function SiteHeader({
  branch,
  branches,
}: {
  branch: SiteBranch
  branches: BranchOption[]
}) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <SiteMenu
          branches={branches}
          currentSlug={branch.slug}
          city={branch.city}
        />
        <Link
          href="/"
          aria-label={`Bowling ${branch.city}`}
          className="shrink-0"
        >
          <BowlingLogo city={branch.city} size="xs" />
        </Link>
      </div>
    </header>
  )
}
