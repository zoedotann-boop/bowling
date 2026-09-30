import { ReviewsForm } from "@/components/admin/sections/reviews-form"
import { requireLocationAccess } from "@/lib/admin/access"
import { getReviewsEditor } from "@/lib/db/queries/admin"

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ location: string }>
}) {
  const { location: slug } = await params
  const { user, location: loc } = await requireLocationAccess(slug, "content")
  const data = await getReviewsEditor(loc.id)

  return (
    <ReviewsForm
      slug={slug}
      canConnect={user.role === "owner"}
      initial={{
        slug,
        googlePlaceId: data?.googlePlaceId ?? "",
        autoSync: data?.googleReviewsAutoSync ?? false,
        reviews: (data?.googleReviews ?? []).map((row) => ({
          id: row.id,
          authorName: row.authorName,
          rating: row.rating,
          text: row.text,
          publishedAt: row.publishedAt.toISOString().slice(0, 10),
          isPublished: row.isPublished,
        })),
      }}
    />
  )
}
