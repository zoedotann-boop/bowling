#!/usr/bin/env bun
import { eq, inArray } from "drizzle-orm"

import { routing } from "@/i18n/routing"
import { branches } from "@/lib/branches"
import { db } from "@/lib/db"
import {
  branch,
  branchTranslation,
  eventOffering,
  eventOfferingTranslation,
  menuCategory,
  menuCategoryTranslation,
  menuItem,
  menuItemTranslation,
  offeringPackage,
  offeringPackageTranslation,
  openingHours,
  priceRow,
  priceRowTranslation,
} from "@/lib/db/schema/content"
import { mediaAsset } from "@/lib/db/schema/media"

const force = process.argv.includes("--force")

const SHOE_LABELS: Record<(typeof routing.locales)[number], string> = {
  en: "Shoe rental",
  ru: "Аренда обуви",
  he: "השכרת נעליים",
  ar: "تأجير أحذية",
}

function parsePriceToCents(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "")
  if (!digits) throw new Error(`price unparseable: "${raw}"`)
  return Number(digits) * 100
}

function detectKind(labelEn: string): "hourly" | "child" | "adult" {
  if (/hour/i.test(labelEn)) return "hourly"
  if (/child/i.test(labelEn)) return "child"
  return "adult"
}

async function existingSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set()
  const rows = await db
    .select({ slug: branch.slug })
    .from(branch)
    .where(inArray(branch.slug, slugs))
  return new Set(rows.map((r) => r.slug))
}

async function seedBranch(b: (typeof branches)[number], now: Date) {
  let rowsInserted = 0

  const heroAssetId = crypto.randomUUID()
  await db.insert(mediaAsset).values({
    id: heroAssetId,
    blobUrl: b.hero.image,
    filename: b.hero.image.split("/").pop() ?? null,
  })
  rowsInserted++

  const branchId = crypto.randomUUID()
  await db.insert(branch).values({
    id: branchId,
    slug: b.slug,
    phone: b.phone,
    whatsapp: b.whatsapp,
    email: b.email,
    mapUrl: b.mapUrl,
    latitude: b.geo.lat,
    longitude: b.geo.lng,
    brandAccent: b.brandAccent,
    heroImageId: heroAssetId,
  })
  rowsInserted++

  for (const locale of routing.locales) {
    await db.insert(branchTranslation).values({
      branchId,
      locale,
      displayName: b.displayName[locale],
      shortName: b.shortName[locale],
      address: b.address[locale],
      city: b.city[locale],
      heroHeadline: b.hero.headline[locale],
      heroTagline: b.hero.tagline[locale],
      seoTitle: b.seo.title[locale],
      seoDescription: b.seo.description[locale],
      aiGenerated: false,
      reviewedAt: now,
    })
    rowsInserted++
  }

  for (let day = 0; day < b.hours.length; day++) {
    const h = b.hours[day]!
    await db.insert(openingHours).values({
      id: crypto.randomUUID(),
      branchId,
      dayOfWeek: day,
      openTime: h.open,
      closeTime: h.close,
      isClosed: false,
    })
    rowsInserted++
  }

  let priceIdx = 0
  for (const p of b.prices) {
    const priceId = crypto.randomUUID()
    await db.insert(priceRow).values({
      id: priceId,
      branchId,
      kind: detectKind(p.label.en),
      weekdayAmountCents: parsePriceToCents(p.weekday),
      weekendAmountCents: parsePriceToCents(p.weekend),
      sortOrder: priceIdx++,
    })
    rowsInserted++
    for (const locale of routing.locales) {
      await db.insert(priceRowTranslation).values({
        priceRowId: priceId,
        locale,
        label: p.label[locale],
        aiGenerated: false,
        reviewedAt: now,
      })
      rowsInserted++
    }
  }
  {
    const shoeId = crypto.randomUUID()
    await db.insert(priceRow).values({
      id: shoeId,
      branchId,
      kind: "shoe",
      weekdayAmountCents: parsePriceToCents(b.shoeRental.weekday),
      weekendAmountCents: parsePriceToCents(b.shoeRental.weekend),
      sortOrder: priceIdx,
    })
    rowsInserted++
    for (const locale of routing.locales) {
      await db.insert(priceRowTranslation).values({
        priceRowId: shoeId,
        locale,
        label: SHOE_LABELS[locale],
        aiGenerated: false,
        reviewedAt: now,
      })
      rowsInserted++
    }
  }

  let pkgIdx = 0
  for (const pkg of b.packages) {
    const pkgId = crypto.randomUUID()
    await db.insert(offeringPackage).values({
      id: pkgId,
      branchId,
      amountCents: parsePriceToCents(pkg.price),
      sortOrder: pkgIdx++,
    })
    rowsInserted++
    for (const locale of routing.locales) {
      await db.insert(offeringPackageTranslation).values({
        packageId: pkgId,
        locale,
        title: pkg.title[locale],
        perks: pkg.perks[locale],
        aiGenerated: false,
        reviewedAt: now,
      })
      rowsInserted++
    }
  }

  let evtIdx = 0
  for (const e of b.events) {
    const evtId = crypto.randomUUID()
    await db.insert(eventOffering).values({
      id: evtId,
      branchId,
      imageId: null,
      sortOrder: evtIdx++,
    })
    rowsInserted++
    for (const locale of routing.locales) {
      await db.insert(eventOfferingTranslation).values({
        eventOfferingId: evtId,
        locale,
        title: e.title[locale],
        description: e.description[locale],
        aiGenerated: false,
        reviewedAt: now,
      })
      rowsInserted++
    }
  }

  let catIdx = 0
  for (const c of b.menu) {
    const catId = crypto.randomUUID()
    await db.insert(menuCategory).values({
      id: catId,
      branchId,
      sortOrder: catIdx++,
    })
    rowsInserted++
    for (const locale of routing.locales) {
      await db.insert(menuCategoryTranslation).values({
        menuCategoryId: catId,
        locale,
        title: c.title[locale],
        aiGenerated: false,
        reviewedAt: now,
      })
      rowsInserted++
    }
    let itemIdx = 0
    for (const item of c.items) {
      const itemId = crypto.randomUUID()
      await db.insert(menuItem).values({
        id: itemId,
        categoryId: catId,
        amountCents: parsePriceToCents(item.price),
        sortOrder: itemIdx++,
      })
      rowsInserted++
      for (const locale of routing.locales) {
        await db.insert(menuItemTranslation).values({
          menuItemId: itemId,
          locale,
          name: item.name[locale],
          tag: item.tag ? item.tag[locale] : null,
          aiGenerated: false,
          reviewedAt: now,
        })
        rowsInserted++
      }
    }
  }

  return rowsInserted
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("[seed] DATABASE_URL is required")
    process.exit(1)
  }

  const slugs = branches.map((b) => b.slug)
  const existing = await existingSlugs(slugs)

  if (force && existing.size) {
    for (const slug of existing) {
      console.log(`[seed] --force: deleting existing branch "${slug}"`)
      await db.delete(branch).where(eq(branch.slug, slug))
    }
  }

  const now = new Date()
  let insertedBranches = 0
  let totalRows = 0

  for (const b of branches) {
    if (!force && existing.has(b.slug)) {
      console.log(`[seed] ${b.slug}: skipping, already exists`)
      continue
    }
    const rows = await seedBranch(b, now)
    totalRows += rows
    insertedBranches++
    console.log(`[seed] ${b.slug}: inserted ${rows} rows`)

    if (b.domains.length) {
      console.log(
        `[seed]   TODO(sub-project H): domains skipped: ${b.domains.join(", ")}`
      )
    }
    console.log(
      `[seed]   TODO(sub-project G): google rating/count/reviews skipped`
    )
  }

  console.log(
    `[seed] done — ${insertedBranches} branch(es) inserted, ${totalRows} rows total`
  )
  process.exit(0)
}

main().catch((err) => {
  console.error("[seed] FAILED:", err)
  process.exit(1)
})
