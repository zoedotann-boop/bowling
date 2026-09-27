import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { NotFoundPage } from "@/components/pages/not-found-page"
import { SiteChrome } from "@/components/site-chrome"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("notFound") }
}

// Unmatched URLs anywhere in the app. It sits above the (site) layout, so it
// adds the site chrome itself to keep the header/footer navigation. `notFound()`
// calls are handled closer by app/(site)/ and app/admin/(dashboard)/not-found.
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundPage />
    </SiteChrome>
  )
}
