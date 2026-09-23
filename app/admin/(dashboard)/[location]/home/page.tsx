import { HomeForm } from "@/components/admin/sections/home-form"
import { requireLocationAccess } from "@/lib/admin/access"
import { toLocalized } from "@/lib/admin/drafts"
import type { HomeDraft } from "@/lib/actions/admin/schemas"
import { getHomeEditor } from "@/lib/db/queries/admin"

export default async function HomePage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { location: loc } = await requireLocationAccess(slug, "content")
  const data = await getHomeEditor(loc.id)

  const draft: HomeDraft = {
    slug,
    heroTitle: toLocalized(data?.home?.heroTitle),
    heroSubtitle: toLocalized(data?.home?.heroSubtitle),
    heroCtaLabel: toLocalized(data?.home?.heroCtaLabel),
    servicesTitle: toLocalized(data?.home?.servicesTitle),
    servicesIntro: toLocalized(data?.home?.servicesIntro),
    galleryTitle: toLocalized(data?.home?.galleryTitle),
    reviewsTitle: toLocalized(data?.home?.reviewsTitle),
    aboutImageUrl: data?.home?.aboutImageUrl ?? "",
    contactTitle: toLocalized(data?.site?.contactTitle),
    contactIntro: toLocalized(data?.site?.contactIntro),
    features: (data?.features ?? []).map((row) => ({
      id: row.id,
      icon: row.icon,
      label: toLocalized(row.label),
      description: toLocalized(row.description),
    })),
    services: (data?.services ?? []).map((row) => ({
      id: row.id,
      title: toLocalized(row.title),
      description: toLocalized(row.description),
      imageUrl: row.imageUrl ?? "",
    })),
    reviews: (data?.reviews ?? []).map((row) => ({
      id: row.id,
      author: toLocalized(row.author),
      quote: toLocalized(row.quote),
      rating: row.rating,
    })),
    gallery: (data?.galleryImages ?? []).map((row) => ({
      id: row.id,
      imageUrl: row.imageUrl,
      alt: toLocalized(row.alt),
    })),
    contactSubjects: (data?.contactSubjects ?? []).map((row) => ({
      id: row.id,
      label: toLocalized(row.label),
    })),
  }

  return <HomeForm slug={slug} initial={draft} />
}
