import { z } from "zod"

const BASE_URL = "https://places.googleapis.com/v1"

const REVIEW_FIELD_MASK = [
  "id",
  "displayName",
  "rating",
  "userRatingCount",
  "reviews.name",
  "reviews.rating",
  "reviews.text.text",
  "reviews.text.languageCode",
  "reviews.originalText.text",
  "reviews.originalText.languageCode",
  "reviews.authorAttribution.displayName",
  "reviews.authorAttribution.photoUri",
  "reviews.publishTime",
].join(",")

export class MissingGooglePlacesKeyError extends Error {
  constructor() {
    super("GOOGLE_PLACES_API_KEY is not set")
    this.name = "MissingGooglePlacesKeyError"
  }
}

export class GooglePlacesApiError extends Error {
  readonly status: number
  readonly body: string
  constructor(status: number, body: string) {
    super(`google_places_api_error status=${status}`)
    this.name = "GooglePlacesApiError"
    this.status = status
    this.body = body
  }
}

const localizedTextSchema = z
  .object({
    text: z.string(),
    languageCode: z.string().optional(),
  })
  .partial()

const reviewSchema = z.object({
  name: z.string(),
  rating: z.number().int().min(1).max(5),
  publishTime: z.string(),
  text: localizedTextSchema.optional(),
  originalText: localizedTextSchema.optional(),
  authorAttribution: z
    .object({
      displayName: z.string().optional(),
      photoUri: z.string().optional(),
    })
    .partial()
    .optional(),
})

const placeSchema = z.object({
  id: z.string().optional(),
  displayName: z
    .object({ text: z.string(), languageCode: z.string().optional() })
    .partial()
    .optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().int().optional(),
  reviews: z.array(reviewSchema).optional(),
})

export type GooglePlace = z.infer<typeof placeSchema>
export type GoogleReview = z.infer<typeof reviewSchema>

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key || key.trim().length === 0) {
    throw new MissingGooglePlacesKeyError()
  }
  return key
}

export async function getPlace(
  placeId: string,
  opts: { signal?: AbortSignal } = {}
): Promise<GooglePlace> {
  const url = `${BASE_URL}/places/${encodeURIComponent(placeId)}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": REVIEW_FIELD_MASK,
    },
    signal: opts.signal,
  })
  const body = await res.text()
  if (!res.ok) throw new GooglePlacesApiError(res.status, body)
  return placeSchema.parse(JSON.parse(body))
}

const searchSchema = z.object({
  places: z
    .array(
      z.object({
        id: z.string(),
        displayName: z
          .object({ text: z.string(), languageCode: z.string().optional() })
          .partial()
          .optional(),
        formattedAddress: z.string().optional(),
      })
    )
    .optional(),
})

export type GooglePlaceSearchResult = z.infer<typeof searchSchema>

export async function searchPlaces(
  query: string,
  opts: { signal?: AbortSignal } = {}
): Promise<GooglePlaceSearchResult> {
  const url = `${BASE_URL}/places:searchText`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ textQuery: query }),
    signal: opts.signal,
  })
  const body = await res.text()
  if (!res.ok) throw new GooglePlacesApiError(res.status, body)
  return searchSchema.parse(JSON.parse(body))
}
