import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { AdminCard } from "@/components/admin/admin-ui"
import { buttonVariants } from "@/components/ui/button"

// `notFound()` inside the dashboard (unknown location, or a capability the user
// lacks). Keeps the admin shell instead of bubbling up to the public-site 404.
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
