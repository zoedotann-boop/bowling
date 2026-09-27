import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { AdminCard } from "@/components/admin/admin-ui"
import { buttonVariants } from "@/components/ui/button"

export default async function AdminNotFound() {
  const t = await getTranslations("admin.notFound")

  return (
    <AdminCard title={t("title")} description={t("text")}>
      <Link href="/admin" className={buttonVariants()}>
        {t("back")}
      </Link>
    </AdminCard>
  )
}
