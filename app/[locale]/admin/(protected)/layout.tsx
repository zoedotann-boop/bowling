import { cookies, headers } from "next/headers"
import { asc, eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { branch, branchTranslation } from "@/lib/db/schema/content"
import { redirect } from "@/i18n/navigation"
import { type Locale } from "@/i18n/routing"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    redirect({ href: "/admin/denied", locale })
    return null
  }

  const cookieStore = await cookies()
  const sidebarCookie = cookieStore.get("sidebar_state")?.value
  const defaultOpen =
    sidebarCookie === undefined ? true : sidebarCookie !== "false"

  const slugLabels = await fetchBranchLabels(locale as Locale)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <SidebarInset>
        <AdminTopbar slugLabels={slugLabels} />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

async function fetchBranchLabels(
  locale: Locale
): Promise<Record<string, string>> {
  const branches = await db
    .select({
      slug: branch.slug,
      fallbackName: branch.slug,
    })
    .from(branch)
    .orderBy(asc(branch.sortOrder))

  if (branches.length === 0) return {}

  const translations = await db
    .select({
      branchId: branchTranslation.branchId,
      locale: branchTranslation.locale,
      displayName: branchTranslation.displayName,
    })
    .from(branchTranslation)
    .where(eq(branchTranslation.locale, locale))

  const nameByBranch = new Map<string, string>()
  for (const tr of translations) {
    if (tr.displayName) nameByBranch.set(tr.branchId, tr.displayName)
  }

  const rows = await db
    .select({ id: branch.id, slug: branch.slug })
    .from(branch)

  const out: Record<string, string> = {}
  for (const row of rows) {
    const name = nameByBranch.get(row.id)
    if (name) out[row.slug] = name
  }
  return out
}
