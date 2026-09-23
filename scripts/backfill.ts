import { drizzle } from "drizzle-orm/postgres-js"
import { eq } from "drizzle-orm"
import postgres from "postgres"

import * as schema from "@/lib/db/schema"
import type { Localized } from "@/lib/db/schema/_shared"
import { BRANCHES, type BranchId } from "@/lib/branches"
import heMessages from "@/messages/he.json"
import enMessages from "@/messages/en.json"

// Backfills the DB from the site's hardcoded content: branch details from
// lib/branches.ts and copy from messages/*.json. Idempotent per location
// (clears and re-inserts that location's content). Run with `bun run db:backfill`.

const he = heMessages as Record<string, unknown>
const en = enMessages as Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const path = (tree: any, keys: (string | number)[]): unknown =>
  keys.reduce((node, key) => (node == null ? node : node[key]), tree)

// Builds a Localized value from the same key-path in both message trees.
function L(keys: (string | number)[]): Localized {
  const hev = path(he, keys)
  const env = path(en, keys)
  return {
    he: typeof hev === "string" ? hev : "",
    en: typeof env === "string" ? env : "",
  }
}

// Parses the first integer out of a price string ("100 ₪", "₪ 12", "17 / 25 ₪").
function money(value: unknown): number | null {
  if (typeof value !== "string") return null
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}

function arr(keys: (string | number)[]): unknown[] {
  const value = path(he, keys)
  return Array.isArray(value) ? value : []
}

async function backfill() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const client = postgres(url, { prepare: false })
  const db = drizzle(client, { schema, casing: "snake_case" })

  for (const branchId of Object.keys(BRANCHES) as BranchId[]) {
    const branch = BRANCHES[branchId]

    // --- location details (upsert by slug) ---
    const locationValues = {
      slug: branch.id,
      name: branch.name,
      addressLine1: branch.addressLine1,
      addressLine2: branch.addressLine2,
      addressFull: branch.addressFull,
      laneDesc: branch.laneDesc,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      wazeUrl: branch.wazeUrl,
      logoUrl: branch.logo.src,
      lanes: branch.lanes,
      hasGymboree: branch.hasGymboree,
      hasNotice: branch.hasNotice,
    }
    await db
      .insert(schema.location)
      .values(locationValues)
      .onConflictDoUpdate({ target: schema.location.slug, set: locationValues })

    const [loc] = await db
      .select({ id: schema.location.id })
      .from(schema.location)
      .where(eq(schema.location.slug, branch.id))
    const locationId = loc.id

    // --- clear this location's content (idempotent re-run) ---
    await db
      .delete(schema.homeFeature)
      .where(eq(schema.homeFeature.locationId, locationId))
    await db
      .delete(schema.homeService)
      .where(eq(schema.homeService.locationId, locationId))
    await db
      .delete(schema.homeReview)
      .where(eq(schema.homeReview.locationId, locationId))
    await db
      .delete(schema.contactSubject)
      .where(eq(schema.contactSubject.locationId, locationId))
    await db
      .delete(schema.menuCategory)
      .where(eq(schema.menuCategory.locationId, locationId))
    await db
      .delete(schema.eventType)
      .where(eq(schema.eventType.locationId, locationId))

    // --- home content ---
    const homeValues = {
      heroTitle: {
        he: `${path(he, ["hero", "titleBefore"]) ?? ""} ${path(he, ["hero", "titleHighlight"]) ?? ""} ${path(he, ["hero", "titleAfter"]) ?? ""}`.trim(),
        en: `${path(en, ["hero", "titleBefore"]) ?? ""} ${path(en, ["hero", "titleHighlight"]) ?? ""} ${path(en, ["hero", "titleAfter"]) ?? ""}`.trim(),
      } as Localized,
      heroSubtitle: L(["hero", "description"]),
      heroCtaLabel: L(["hero", "whatsapp"]),
      servicesTitle: L(["services", "title"]),
      servicesIntro: L(["services", "eyebrow"]),
      galleryTitle: L(["gallery", "title"]),
      reviewsTitle: L(["reviews", "title"]),
    }
    await db
      .insert(schema.homeContent)
      .values({ locationId, ...homeValues })
      .onConflictDoUpdate({
        target: schema.homeContent.locationId,
        set: homeValues,
      })

    const siteValues = {
      contactTitle: L(["contact", "title"]),
      contactIntro: L(["contact", "eyebrow"]),
      footerNote: L(["footer", "note"]),
    }
    await db
      .insert(schema.siteContent)
      .values({ locationId, ...siteValues })
      .onConflictDoUpdate({
        target: schema.siteContent.locationId,
        set: siteValues,
      })

    // --- features ---
    await db.insert(schema.homeFeature).values(
      arr(["features"]).map((_, i) => ({
        locationId,
        icon: "",
        label: L(["features", i, "title"]),
        description: L(["features", i, "desc"]),
        sortOrder: i,
      }))
    )

    // --- services ---
    await db.insert(schema.homeService).values(
      arr(["services", "items"]).map((_, i) => ({
        locationId,
        title: L(["services", "items", i, "title"]),
        description: L(["services", "items", i, "desc"]),
        sortOrder: i,
      }))
    )

    // --- reviews ---
    await db.insert(schema.homeReview).values(
      arr(["reviews", "items"]).map((_, i) => ({
        locationId,
        author: L(["reviews", "items", i, "name"]),
        quote: L(["reviews", "items", i, "quote"]),
        rating: 5,
        sortOrder: i,
      }))
    )

    // --- contact subjects ---
    await db.insert(schema.contactSubject).values(
      arr(["contact", "topics"]).map((_, i) => ({
        locationId,
        label: L(["contact", "topics", i]),
        sortOrder: i,
      }))
    )

    // --- menu ---
    const menuValues = {
      heading: L(["menuPage", "title"]),
      intro: L(["menuPage", "subtitle"]),
    }
    await db
      .insert(schema.menuContent)
      .values({ locationId, ...menuValues })
      .onConflictDoUpdate({
        target: schema.menuContent.locationId,
        set: menuValues,
      })
    const categories = arr(["menuPage", "categories"])
    for (let c = 0; c < categories.length; c++) {
      const [cat] = await db
        .insert(schema.menuCategory)
        .values({
          locationId,
          label: L(["menuPage", "categories", c, "label"]),
          sortOrder: c,
        })
        .returning({ id: schema.menuCategory.id })
      const items = arr(["menuPage", "categories", c, "items"])
      if (items.length > 0) {
        await db.insert(schema.menuItem).values(
          items.map((item, i) => ({
            categoryId: cat.id,
            name: L(["menuPage", "categories", c, "items", i, "name"]),
            description: L(["menuPage", "categories", c, "items", i, "desc"]),
            amount: money((item as { price?: string }).price),
            sortOrder: i,
          }))
        )
      }
    }

    // --- event types (per branch) ---
    const cards = arr(["eventsPage", "cards"]) as { id: string }[]
    for (let e = 0; e < branch.events.length; e++) {
      const slug = branch.events[e]
      const cardIndex = cards.findIndex((card) => card.id === slug)
      const [type] = await db
        .insert(schema.eventType)
        .values({
          locationId,
          slug,
          name:
            cardIndex >= 0
              ? L(["eventsPage", "cards", cardIndex, "title"])
              : { he: slug, en: slug },
          sortOrder: e,
        })
        .returning({ id: schema.eventType.id })
      const eventTypeId = type.id

      await db.insert(schema.eventTypeContent).values({
        eventTypeId,
        heroTitle: L(["eventDetails", "items", slug, "title"]),
        heroDescription: L(["eventDetails", "items", slug, "description"]),
      })

      const steps = arr(["eventDetails", "items", slug, "schedule", "steps"])
      if (steps.length > 0) {
        await db.insert(schema.eventStep).values(
          steps.map((_, i) => ({
            eventTypeId,
            title: L([
              "eventDetails",
              "items",
              slug,
              "schedule",
              "steps",
              i,
              "title",
            ]),
            description: L([
              "eventDetails",
              "items",
              slug,
              "schedule",
              "steps",
              i,
              "desc",
            ]),
            sortOrder: i,
          }))
        )
      }

      const included = arr(["eventDetails", "items", slug, "included"])
      if (included.length > 0) {
        await db.insert(schema.eventPackageLine).values(
          included.map((_, i) => ({
            eventTypeId,
            label: L(["eventDetails", "items", slug, "included", i]),
            sortOrder: i,
          }))
        )
      }

      const extras = arr(["eventDetails", "items", slug, "extras"])
      if (extras.length > 0) {
        await db.insert(schema.eventUpgrade).values(
          extras.map((extra, i) => ({
            eventTypeId,
            label: L(["eventDetails", "items", slug, "extras", i, "title"]),
            amount: money((extra as { price?: string }).price),
            sortOrder: i,
          }))
        )
      }
    }

    console.log(`backfilled ${branch.id}`)
  }

  await client.end()
  console.log("Backfill complete.")
}

backfill().catch((error) => {
  console.error(error)
  process.exit(1)
})
