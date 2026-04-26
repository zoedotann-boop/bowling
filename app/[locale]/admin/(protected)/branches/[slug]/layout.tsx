import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import type { Locale } from "@/i18n/routing"
import { PageHeader } from "@/components/admin/shared/page-header"

import { loadBranchBySlug } from "./_lib/load"

export default async function BranchEditLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: "Admin.branches.form" })

  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("editTitle", { name: loaded.displayName })}
        description={loaded.row.slug}
      />
      {children}
    </div>
  )
}
