import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  GooglePlacesApiError,
  MissingGooglePlacesKeyError,
  getPlace,
  searchPlaces,
} from "../google-places"

const ORIGINAL_KEY = process.env.GOOGLE_PLACES_API_KEY

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
  process.env.GOOGLE_PLACES_API_KEY = "test-key"
})

afterEach(() => {
  vi.unstubAllGlobals()
  process.env.GOOGLE_PLACES_API_KEY = ORIGINAL_KEY
})

function mockFetchOnce(body: unknown, init: { status?: number } = {}) {
  ;(fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: (init.status ?? 200) < 400,
    status: init.status ?? 200,
    text: async () => JSON.stringify(body),
  })
}

describe("getPlace", () => {
  it("throws MissingGooglePlacesKeyError when env var is unset", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY
    await expect(getPlace("abc")).rejects.toBeInstanceOf(
      MissingGooglePlacesKeyError
    )
  })

  it("sends X-Goog-Api-Key + reviews FieldMask and parses response", async () => {
    mockFetchOnce({
      id: "abc",
      displayName: { text: "Bowling House", languageCode: "en" },
      rating: 4.3,
      userRatingCount: 82,
      reviews: [
        {
          name: "places/abc/reviews/r1",
          rating: 5,
          publishTime: "2026-03-01T10:00:00Z",
          text: { text: "Great time!", languageCode: "en" },
          originalText: { text: "היה כיף", languageCode: "he" },
          authorAttribution: { displayName: "Alice", photoUri: "https://x" },
        },
      ],
    })

    const place = await getPlace("abc")
    expect(place.reviews?.[0]?.originalText?.text).toBe("היה כיף")

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain("places.googleapis.com/v1/places/abc")
    expect(init.headers["X-Goog-Api-Key"]).toBe("test-key")
    expect(init.headers["X-Goog-FieldMask"]).toContain("reviews.text.text")
    expect(init.headers["X-Goog-FieldMask"]).toContain(
      "reviews.originalText.text"
    )
  })

  it("throws GooglePlacesApiError on non-2xx", async () => {
    mockFetchOnce({ error: { status: "PERMISSION_DENIED" } }, { status: 403 })
    await expect(getPlace("abc")).rejects.toBeInstanceOf(GooglePlacesApiError)
  })
})

describe("searchPlaces", () => {
  it("POSTs textQuery with the search FieldMask", async () => {
    mockFetchOnce({
      places: [
        {
          id: "x1",
          displayName: { text: "Bowling", languageCode: "en" },
          formattedAddress: "Ramat Gan",
        },
      ],
    })

    const result = await searchPlaces("bowling ramat gan")
    expect(result.places?.[0]?.id).toBe("x1")

    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe("POST")
    expect(init.headers["X-Goog-FieldMask"]).toContain("places.id")
    expect(JSON.parse(init.body).textQuery).toBe("bowling ramat gan")
  })
})
