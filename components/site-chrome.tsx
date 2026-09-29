import { BranchProvider } from "@/components/branch-context"
import { BranchNotice } from "@/components/home/branch-notice"
import { MobileFloatingActions } from "@/components/home/mobile-floating-actions"
import { SiteFooter } from "@/components/home/site-footer"
import { SiteHeader } from "@/components/home/site-header"
import { PageTransition } from "@/components/page-transition"
import { SiteContentProvider } from "@/components/site-content-context"
import { byBranch, type BranchId } from "@/lib/branches"
import { getHomeContent, getSiteBranches } from "@/lib/db/queries/site"

export async function SiteChrome({
  branchId,
  children,
}: {
  branchId: BranchId
  children: React.ReactNode
}) {
  const [branches, contentRows] = await Promise.all([
    getSiteBranches(),
    getHomeContent().catch(() => []),
  ])
  const content = byBranch(contentRows)

  return (
    <BranchProvider branchId={branchId} branches={branches}>
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
