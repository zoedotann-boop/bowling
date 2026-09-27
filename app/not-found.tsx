import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { NotFoundPage } from "@/components/pages/not-found-page"
import { SiteChrome } from "@/components/site-chrome"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("notFound") }
}

// The single 404 for the whole app: unmatched URLs and every `notFound()` call
// (public pages and admin access checks). It sits above the (site) layout, so it
// adds the site chrome itself to keep the header/footer navigation.
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundPage />
    </SiteChrome>
  )
}
