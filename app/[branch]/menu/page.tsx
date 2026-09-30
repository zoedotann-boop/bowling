import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MenuPage } from "@/components/pages/menu-page"
import { byBranch } from "@/lib/branches"
import { getMenus, logError } from "@/lib/db/queries/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("menu") }
}

export default async function Page() {
  const menus = byBranch(await getMenus().catch(logError("getMenus", [])))
  return <MenuPage menus={menus} />
}
