import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { routing, type Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { PageHeader } from "@/components/admin/page-header"
import {
  LegalPagesManager,
  type LegalPageRow,
} from "@/components/admin/legal-pages-manager"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch legal",
  robots: { index: false, follow: false },
}

export default async function BranchLegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()

  const t = await getTranslations({ locale, namespace: "Admin.legal" })
  const pages = await services.legal.listByBranch(loaded.row.id)
  const rows: LegalPageRow[] = pages.map((page) => {
    const titles = {} as Record<Locale, string | null>
    const bodies = {} as Record<Locale, string | null>
    for (const loc of routing.locales) {
      titles[loc] = null
      bodies[loc] = null
    }
    titles.he = page.titleHe
    titles.en = page.titleEn
    titles.ru = page.titleRu
    titles.ar = page.titleAr
    bodies.he = page.bodyMarkdownHe
    bodies.en = page.bodyMarkdownEn
    bodies.ru = page.bodyMarkdownRu
    bodies.ar = page.bodyMarkdownAr
    return {
      slug: page.slug,
      titles,
      bodies,
      published: page.published,
      sortOrder: page.sortOrder,
    }
  })

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <LegalPagesManager initial={rows} branchId={loaded.row.id} />
    </div>
  )
}
