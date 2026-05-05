import { redirect } from "@/i18n/navigation"

export default async function BranchEditIndexPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  redirect({ href: `/admin/branches/${slug}/general`, locale })
}
