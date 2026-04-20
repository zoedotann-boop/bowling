import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { routing, type Locale } from "@/i18n/routing"
import * as services from "@/lib/services"
import { PageHeader } from "@/components/admin/page-header"
import {
  FooterLinksManager,
  type FooterLinkRow,
} from "@/components/admin/footer-links-manager"
import {
  LegalPagesManager,
  type LegalPageRow,
} from "@/components/admin/legal-pages-manager"

export const metadata: Metadata = {
  title: "Admin · Footer",
  robots: { index: false, follow: false },
}

const SUGGESTED_GROUP_KEYS = ["branches", "contact", "legal"]

export default async function AdminFooterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Admin.footer" })

  const footerLinks = await services.footer.listAll()
  const linkRows: FooterLinkRow[] = footerLinks.map((link) => ({
    id: link.id,
    locale: link.locale,
    groupKey: link.groupKey,
    label: link.label,
    href: link.href,
    sortOrder: link.sortOrder,
  }))

  const legalPages = await services.legal.listAdmin()
  const legalRows: LegalPageRow[] = legalPages.map((page) => {
    const titles = {} as Record<Locale, string | null>
    const bodies = {} as Record<Locale, string | null>
    titles.he = page.titleHe
    titles.en = page.titleEn
    titles.ru = page.titleRu
    titles.ar = page.titleAr
    bodies.he = page.bodyMarkdownHe
    bodies.en = page.bodyMarkdownEn
    bodies.ru = page.bodyMarkdownRu
    bodies.ar = page.bodyMarkdownAr
    void routing
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
      <FooterLinksManager
        initial={linkRows}
        suggestedGroupKeys={SUGGESTED_GROUP_KEYS}
      />
      <LegalPagesManager initial={legalRows} />
    </div>
  )
}
