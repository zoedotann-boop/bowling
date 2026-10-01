import { beforeEach, describe, expect, test } from "bun:test"
import { asc, eq } from "drizzle-orm"

import { toPricingDraft } from "@/lib/admin/drafts"
import { homeFeature, homeService, siteContent } from "@/lib/db/schema"
import {
  access,
  db,
  resetLocations,
  text,
} from "@/lib/db/testing/admin-actions"

import type { HomeDraft } from "./schemas"

const { saveHome } = await import("./home")

function homeDraft(patch: Partial<HomeDraft> = {}): HomeDraft {
  return {
    slug: access.location.slug,
    heroTitle: text("כותרת"),
    heroSubtitle: text(""),
    heroCtaLabel: text(""),
    servicesTitle: text(""),
    servicesIntro: text(""),
    galleryTitle: text(""),
    reviewsTitle: text(""),
    contactTitle: text("דברו איתנו"),
    contactIntro: text(""),
    pricing: toPricingDraft(null),
    features: [],
    services: [],
    gallery: [],
    contactSubjects: [],
    ...patch,
  }
}

const features = () =>
  db.query.homeFeature.findMany({
    where: eq(homeFeature.locationId, access.location.id),
    orderBy: [asc(homeFeature.sortOrder)],
  })

const services = () =>
  db.query.homeService.findMany({
    where: eq(homeService.locationId, access.location.id),
    orderBy: [asc(homeService.sortOrder)],
  })

function service(
  patch: Partial<HomeDraft["services"][number]> = {}
): HomeDraft["services"][number] {
  return {
    title: text("שירות"),
    description: text(""),
    icon: "bowling",
    imageUrl: "",
    ...patch,
  }
}

beforeEach(async () => {
  await resetLocations()
})

describe("saveHome", () => {
  test("saves singleton content and ordered rows", async () => {
    const result = await saveHome(
      homeDraft({
        features: [
          { icon: "bar", label: text("בר"), description: text("") },
          { icon: "", label: text("מסלולים"), description: text("16") },
        ],
      })
    )

    expect(result).toEqual({ ok: true })
    expect((await features()).map((row) => [row.label.he, row.icon])).toEqual([
      ["בר", "bar"],
      ["מסלולים", ""],
    ])
    const site = await db.query.siteContent.findFirst({
      where: eq(siteContent.locationId, access.location.id),
    })
    expect(site?.contactTitle).toEqual(text("דברו איתנו"))
  })

  test("a second save updates rows in place instead of re-creating them", async () => {
    await saveHome(
      homeDraft({
        features: [{ icon: "", label: text("א"), description: text("") }],
      })
    )
    const [saved] = await features()

    await saveHome(
      homeDraft({
        heroTitle: text("חדש"),
        features: [
          { id: saved.id, icon: "", label: text("א2"), description: text("") },
        ],
      })
    )

    const rows = await features()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: saved.id, label: text("א2") })
  })

  test("removing every row clears the list", async () => {
    await saveHome(
      homeDraft({
        contactSubjects: [{ label: text("כללי") }],
        features: [{ icon: "", label: text("א"), description: text("") }],
      })
    )
    await saveHome(homeDraft())

    expect(await features()).toEqual([])
    expect(await db.query.contactSubject.findMany()).toEqual([])
  })

  test("saves each service card's illustration and uploaded picture", async () => {
    const picture = "https://x.public.blob.vercel-storage.com/admin/arcade.png"
    const result = await saveHome(
      homeDraft({
        services: [
          service({ title: text("ג׳ימבורי"), icon: "gymboree" }),
          service({ title: text("ארקייד"), icon: "party", imageUrl: picture }),
        ],
      })
    )

    expect(result).toEqual({ ok: true })
    expect(
      (await services()).map((row) => [row.title.he, row.icon, row.imageUrl])
    ).toEqual([
      ["ג׳ימבורי", "gymboree", null],
      ["ארקייד", "party", picture],
    ])
  })

  test("rejects an unknown illustration or an invalid picture address", async () => {
    await saveHome(homeDraft({ services: [service({ icon: "menu" })] }))

    for (const bad of [
      service({ icon: "rocket" as "menu" }),
      service({ imageUrl: "javascript:alert(1)" }),
      service({ imageUrl: "http://example.com/a.png" }),
    ]) {
      expect(await saveHome(homeDraft({ services: [bad] }))).toEqual({
        ok: false,
        error: "invalid",
      })
    }
    expect((await services()).map((row) => row.icon)).toEqual(["menu"])
  })
})
