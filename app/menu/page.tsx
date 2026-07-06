import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MenuPage } from "@/components/pages/menu-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("menu") }
}

export default function Page() {
  return <MenuPage />
}
