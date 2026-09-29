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
  byBranch,
  DEFAULT_BRANCH,
  isBranchId,
} from "@/lib/branches"
import { getHomeContent, getSiteBranches } from "@/lib/db/queries/site"

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const branchCookie = cookieStore.get(BRANCH_COOKIE)?.value
  const initialBranch = isBranchId(branchCookie) ? branchCookie : DEFAULT_BRANCH

  const [branches, contentRows] = await Promise.all([
    getSiteBranches(),
    getHomeContent().catch(() => []),
  ])
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
