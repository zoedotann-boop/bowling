import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { NotFoundPage } from "@/components/pages/not-found-page"
import { SiteChrome } from "@/components/site-chrome"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("notFound") }
}

export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundPage />
    </SiteChrome>
  )
}
