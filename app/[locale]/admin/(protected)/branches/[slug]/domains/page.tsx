import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { PageHeader } from "@/components/admin/shared/page-header"
import {
  BranchDomainsForm,
  type BranchDomainRow,
} from "@/components/admin/branch/branch-domains-form"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch domains",
  robots: { index: false, follow: false },
}

export default async function BranchDomainsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()

  const t = await getTranslations({ locale, namespace: "Admin.domains" })
  const domains = await services.domains.listForBranch(loaded.row.id)
  const rows: BranchDomainRow[] = domains.map((d) => ({
    id: d.id,
    host: d.host,
  }))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <BranchDomainsForm branchId={loaded.row.id} initial={rows} />
    </div>
  )
}
