import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { IconPlus } from "@tabler/icons-react"

import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { Button } from "@/components/ui/button"
import { BranchList, type BranchListItem } from "@/components/admin/branch-list"

export const metadata: Metadata = {
  title: "Admin · Branches",
  robots: { index: false, follow: false },
}

export default async function AdminBranchesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Admin.branches.list" })
  const { data: branches } = await services.branches.list(locale as Locale)

  const items: BranchListItem[] = branches.map((b) => ({
    id: b.id,
    slug: b.slug,
    displayName: b.displayName ?? b.slug,
    published: b.published,
  }))

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <Button
          render={
            <Link href="/admin/branches/new">
              <IconPlus className="size-4" />
              {t("newBranch")}
            </Link>
          }
          size="sm"
        />
      </header>
      <BranchList items={items} />
    </div>
  )
}
