import { MenuForm } from "@/components/admin/sections/menu-form"
import { requireLocationAccess } from "@/lib/admin/access"
import { toLocalized } from "@/lib/admin/drafts"
import type { MenuDraft } from "@/lib/actions/admin/schemas"
import { getMenuEditor } from "@/lib/db/queries/admin"

export default async function MenuPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "content")
  const data = await getMenuEditor(loc.id)

  const draft: MenuDraft = {
    slug,
    heading: toLocalized(data?.menu?.heading),
    intro: toLocalized(data?.menu?.intro),
    categories: (data?.menuCategories ?? []).map((category) => ({
      id: category.id,
      label: toLocalized(category.label),
      isVisible: category.isVisible,
      items: category.items.map((item) => ({
        id: item.id,
        name: toLocalized(item.name),
        description: toLocalized(item.description),
        amount: item.amount,
        isVisible: item.isVisible,
      })),
    })),
  }

  return <MenuForm slug={slug} initial={draft} />
}
