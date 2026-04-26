import type { Metadata } from "next"
import { asc } from "drizzle-orm"

import { redirect } from "@/i18n/navigation"
import { db } from "@/lib/db"
import { branch } from "@/lib/db/schema/content"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const [first] = await db
    .select({ slug: branch.slug })
    .from(branch)
    .orderBy(asc(branch.sortOrder))
    .limit(1)

  redirect({
    href: first ? `/admin/branches/${first.slug}/info` : "/admin/branches/new",
    locale,
  })
}
