import { cookies } from "next/headers"

import { BranchProvider } from "@/components/branch-context"
import { BranchNotice } from "@/components/home/branch-notice"
import { MobileFloatingActions } from "@/components/home/mobile-floating-actions"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { PageTransition } from "@/components/page-transition"
import { SiteContentProvider } from "@/components/site-content-context"
import {
  BRANCH_COOKIE,
  BRANCHES,
  branchIds,
  byBranch,
  type Branch,
  type BranchId,
  DEFAULT_BRANCH,
  isBranchId,
} from "@/lib/branches"
import { getHomeContent, getSiteLocations } from "@/lib/db/queries/site"

function mergeBranch(base: Branch, row: BranchRow | undefined): Branch {
  if (!row) return base
  const loc = (
    value: { he?: string; en?: string } | null,
    fallback: { he: string; en: string }
  ) => ({
    he: value?.he?.trim() || fallback.he,
    en: value?.en?.trim() || fallback.en,
  })
  return {
    ...base,
    name: loc(row.name, base.name),
    addressLine1: loc(row.addressLine1, base.addressLine1),
    addressLine2: loc(row.addressLine2, base.addressLine2),
    addressFull: loc(row.addressFull, base.addressFull),
    laneDesc: loc(row.laneDesc, base.laneDesc),
    phone: row.phone || base.phone,
    whatsapp: row.whatsapp || base.whatsapp,
    wazeUrl: row.wazeUrl || base.wazeUrl,
    lanes: row.lanes || base.lanes,
    hasGymboree: row.hasGymboree,
    hasNotice: row.hasNotice,
  }
}

type BranchRow = Awaited<ReturnType<typeof getSiteLocations>>[number]

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const branchCookie = cookieStore.get(BRANCH_COOKIE)?.value
  const initialBranch = isBranchId(branchCookie) ? branchCookie : DEFAULT_BRANCH

  const [rows, contentRows] = await Promise.all([
    getSiteLocations().catch(() => []),
    getHomeContent().catch(() => []),
  ])
  const bySlug = new Map(rows.map((row) => [row.slug, row]))
  const branches = Object.fromEntries(
    branchIds.map((id) => [id, mergeBranch(BRANCHES[id], bySlug.get(id))])
  ) as Record<BranchId, Branch>
  const content = byBranch(contentRows)

  return (
    <BranchProvider initial={initialBranch} branches={branches}>
      <SiteContentProvider content={content}>
        <div className="flex min-h-svh flex-col bg-cream">
          <SiteHeader />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
          <div className="h-[72px] lg:hidden" aria-hidden />
          <MobileFloatingActions />
        </div>
        <BranchNotice />
      </SiteContentProvider>
    </BranchProvider>
  )
}
