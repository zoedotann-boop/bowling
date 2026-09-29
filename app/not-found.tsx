import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { NotFoundPage } from "@/components/pages/not-found-page"
import { SiteChrome } from "@/components/site-chrome"
import { DEFAULT_BRANCH } from "@/lib/branches"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("notFound") }
}

export default function NotFound() {
  return (
    <SiteChrome branchId={DEFAULT_BRANCH}>
      <NotFoundPage />
    </SiteChrome>
  )
}
