import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import type { Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { PageHeader } from "@/components/admin/shared/page-header"
import {
  FooterLinksManager,
  type FooterLinkRow,
} from "@/components/admin/footer-links-manager"

import { loadBranchBySlug } from "../_lib/load"

export const metadata: Metadata = {
  title: "Admin · Branch footer",
  robots: { index: false, follow: false },
}

const SUGGESTED_GROUP_KEYS = ["branches", "contact", "legal"]

export default async function BranchFooterPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const loaded = await loadBranchBySlug(slug, locale as Locale)
  if (!loaded) notFound()

  const t = await getTranslations({ locale, namespace: "Admin.footer" })
  const footerLinks = await services.footer.listByBranch(loaded.row.id)
  const linkRows: FooterLinkRow[] = footerLinks.map((link) => ({
    id: link.id,
    locale: link.locale,
    groupKey: link.groupKey,
    label: link.label,
    href: link.href,
    sortOrder: link.sortOrder,
  }))

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <FooterLinksManager
        initial={linkRows}
        suggestedGroupKeys={SUGGESTED_GROUP_KEYS}
        branchId={loaded.row.id}
      />
    </div>
  )
}
