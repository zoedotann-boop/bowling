import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function AdminNav() {
  const t = useTranslations("Admin.nav")
  return (
    <nav className="flex items-center justify-between gap-4 border-b border-line pb-4">
      <div className="flex items-center gap-6">
        <Link
          href="/admin"
          className="font-heading text-sm font-medium tracking-wide text-ink"
        >
          {t("brand")}
        </Link>
        <Link
          href="/admin/branches"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          {t("branches")}
        </Link>
        <Link
          href="/admin/media"
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          {t("media")}
        </Link>
      </div>
      <SignOutButton />
    </nav>
  )
}
