import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { LegalPage } from "@/components/pages/legal-page"
import { byBranch } from "@/lib/branches"
import { getLegalPages } from "@/lib/db/queries/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pageMeta")
  return { title: t("terms") }
}

export default async function Page() {
  const pages = byBranch(await getLegalPages("terms").catch(() => []))
  return <LegalPage kind="terms" pages={pages} />
}
