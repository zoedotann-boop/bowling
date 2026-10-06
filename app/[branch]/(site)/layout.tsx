import { notFound } from "next/navigation"

import { SiteChrome } from "@/components/site-chrome"
import { isBranchId } from "@/lib/branches"

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ branch: string }>
}) {
  const { branch } = await params
  if (!isBranchId(branch)) notFound()
  return <SiteChrome branchId={branch}>{children}</SiteChrome>
}
