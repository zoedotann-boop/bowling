import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { branch } from "@/lib/db/schema/content"
import { PageHeader } from "@/components/admin/page-header"
import {
  BranchContactForm,
  type BranchContactInitial,
} from "@/components/admin/branch-contact-form"

export const metadata: Metadata = {
  title: "Admin · Edit contact",
  robots: { index: false, follow: false },
}

export default async function EditBranchContactPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: "Admin.contact" })

  const [row] = await db
    .select()
    .from(branch)
    .where(eq(branch.slug, slug))
    .limit(1)
  if (!row) notFound()

  const initial: BranchContactInitial = {
    id: row.id,
    slug: row.slug,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    mapUrl: row.mapUrl,
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={t("editTitle", { slug })} description={slug} />
      <BranchContactForm initial={initial} />
    </div>
  )
}
