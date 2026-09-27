import "server-only"

const MAX_PAGES = 2
const PAGE_SIZE = 20

interface GooglePlaceReview {
  externalId: string
  authorName: string
  rating: number
  text: string
  publishedAt: Date
}

interface SerpApiResponse {
  error?: string
  serpapi_pagination?: { next_page_token?: string }
  reviews?: {
    review_id?: string
    rating?: number
    iso_date?: string
    snippet?: string
    extracted_snippet?: { original?: string }
    user?: { name?: string }
  }[]
}

type FetchReviewsResult =
  { ok: true; reviews: GooglePlaceReview[] } | { ok: false; error: string }

export async function fetchPlaceReviews(
  placeId: string
): Promise<FetchReviewsResult> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return { ok: false, error: "missing-key" }

  const reviews = new Map<string, GooglePlaceReview>()
  let pageToken: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await fetchPage({ apiKey, placeId, pageToken })
    if (!result.ok)
      return page === 0 ? result : { ok: true, reviews: [...reviews.values()] }
    for (const review of result.reviews) reviews.set(review.externalId, review)
    pageToken = result.nextPageToken
    if (!pageToken) break
  }

  return { ok: true, reviews: [...reviews.values()] }
}

async function fetchPage({
  apiKey,
  placeId,
  pageToken,
}: {
  apiKey: string
  placeId: string
  pageToken?: string
}): Promise<
  | { ok: true; reviews: GooglePlaceReview[]; nextPageToken?: string }
  | { ok: false; error: string }
> {
  const query = new URLSearchParams({
    engine: "google_maps_reviews",
    place_id: placeId,
    hl: "he",
    sort_by: "qualityScore",
    api_key: apiKey,
    ...(pageToken && { next_page_token: pageToken, num: String(PAGE_SIZE) }),
  })

  try {
    const response = await fetch(`https://serpapi.com/search.json?${query}`, {
      cache: "no-store",
    })
    const data = (await response
      .json()
      .catch(() => null)) as SerpApiResponse | null

    if (data?.error) return { ok: false, error: data.error }
    if (!response.ok) return { ok: false, error: `HTTP ${response.status}` }

    const reviews = (data?.reviews ?? [])
      .map((review) => ({
        externalId: review.review_id ?? "",
        authorName: review.user?.name ?? "",
        rating: Math.min(5, Math.max(1, Math.round(review.rating ?? 5))),
        text: review.extracted_snippet?.original ?? review.snippet ?? "",
        publishedAt: review.iso_date ? new Date(review.iso_date) : new Date(),
      }))
      // Rating-only reviews have nothing to show on the site.
      .filter((review) => review.externalId && review.text)

    return {
      ok: true,
      reviews,
      nextPageToken: data?.serpapi_pagination?.next_page_token,
    }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
