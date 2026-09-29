import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BranchChooser } from "@/components/home/branch-chooser"
import { getSiteBranches } from "@/lib/db/queries/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("branchChooser")
  return { title: t("meta") }
}

export default async function BranchesPage() {
  const branches = await getSiteBranches()
  return <BranchChooser branches={Object.values(branches)} />
}
