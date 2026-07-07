import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AccessibilityPage } from "@/components/pages/accessibility-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("accessibility") }
}

export default function Page() {
  return <AccessibilityPage />
}
