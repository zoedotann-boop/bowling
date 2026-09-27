import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { NotFoundPage } from "@/components/pages/not-found-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("notFound") }
}

// `notFound()` thrown by a public page (e.g. an unknown /events/[slug]). The
// (site) layout already renders the chrome, so this is just the page body.
export default function NotFound() {
  return <NotFoundPage />
}
