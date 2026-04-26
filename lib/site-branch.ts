import { asc, eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { cookies, headers } from "next/headers"

import type { Locale } from "@/i18n/routing"
import { db } from "@/lib/db"
import { branch, branchTranslation } from "@/lib/db/schema/content"
import * as services from "@/lib/services"
import { FALLBACK_LOCALE, resolveLocalized } from "@/lib/services/locale"

export const BRANCH_COOKIE = "site-branch"

export type SiteHours = {
  day: string
  open: string
  close: string
  isClosed: boolean
}

export type SitePriceRow = {
  label: string
  weekday: string
  weekend: string
}

export type SitePackage = {
  title: string
  price: string
  perks: string
}

export type SiteEvent = {
  title: string
  description: string
  image: string | null
}

export type SiteMenuItem = {
  name: string
  price: string
  tag: string | null
}

export type SiteMenuCategory = {
  title: string
  items: SiteMenuItem[]
}

export type SiteReview = {
  author: string
  rating: number
  date: string
  text: string
}

export type SiteBranch = {
  id: string
  slug: string
  displayName: string
  shortName: string
  address: string
  city: string
  phone: string
  whatsapp: string
  email: string
  mapUrl: string
  geo: { lat: number; lng: number }
  hours: SiteHours[]
  hero: {
    image: string | null
    headline: string
    tagline: string
  }
  prices: SitePriceRow[]
  packages: SitePackage[]
  events: SiteEvent[]
  menu: SiteMenuCategory[]
  google: {
    rating: number
    count: number
    profileUrl: string
    reviews: SiteReview[]
  }
  seo: { title: string; description: string }
}

async function getDefaultSlug(): Promise<string | null> {
  const load = unstable_cache(
    async () => {
      const [row] = await db
        .select({ slug: branch.slug })
        .from(branch)
        .where(eq(branch.published, true))
        .orderBy(asc(branch.sortOrder), asc(branch.slug))
        .limit(1)
      return row?.slug ?? null
    },
    ["site-branch:default-slug"],
    { tags: [services.tags.branchAll()] }
  )
  return load()
}

export type BranchOption = {
  slug: string
  shortName: string
  city: string
}

export async function listPublishedBranches(
  locale: Locale
): Promise<BranchOption[]> {
  const load = unstable_cache(
    async () => {
      const rows = await db
        .select({
          id: branch.id,
          slug: branch.slug,
        })
        .from(branch)
        .where(eq(branch.published, true))
        .orderBy(asc(branch.sortOrder), asc(branch.slug))
      if (rows.length === 0) return []
      const translations = await db.select().from(branchTranslation)
      const byBranch = new Map<
        string,
        (typeof branchTranslation.$inferSelect)[]
      >()
      for (const t of translations) {
        const arr = byBranch.get(t.branchId) ?? []
        arr.push(t)
        byBranch.set(t.branchId, arr)
      }
      return rows.map((row) => {
        const { data } = resolveLocalized<{
          shortName: string | null
          city: string | null
        }>(byBranch.get(row.id) ?? [], locale, ["shortName", "city"] as const)
        return {
          slug: row.slug,
          shortName: data.shortName ?? row.slug,
          city: data.city ?? "",
        }
      })
    },
    ["site-branch:published-list", locale],
    { tags: [services.tags.branchAll()] }
  )
  return load()
}

function normalizeHost(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim().toLowerCase()
  if (!trimmed) return null
  const withoutPort = trimmed.split(":")[0] ?? trimmed
  return withoutPort || null
}

async function getSlugFromHost(): Promise<string | null> {
  const hdrs = await headers()
  const host = normalizeHost(hdrs.get("x-forwarded-host") ?? hdrs.get("host"))
  if (!host) return null
  return services.domains.findSlugByHost(host)
}

export async function getSelectedSlug(): Promise<string | null> {
  const fromHost = await getSlugFromHost()
  if (fromHost) return fromHost

  const jar = await cookies()
  const picked = jar.get(BRANCH_COOKIE)?.value
  if (picked) {
    const [row] = await db
      .select({ slug: branch.slug })
      .from(branch)
      .where(eq(branch.slug, picked))
      .limit(1)
    if (row?.slug) return row.slug
  }
  return getDefaultSlug()
}

export async function loadSiteBranch(
  locale: Locale,
  slug?: string
): Promise<SiteBranch | null> {
  const targetSlug = slug ?? (await getSelectedSlug())
  if (!targetSlug) return null

  const loaded = await services.branches.getBySlug(targetSlug, locale)
  if (!loaded) return null
  const b = loaded.data

  const [hoursRows, prices, packages, events, menu, reviews, reviewCache] =
    await Promise.all([
      services.hours.listByBranch(targetSlug),
      services.prices.listByBranch(targetSlug, locale),
      services.packages.listByBranch(targetSlug, locale),
      services.events.listByBranch(targetSlug, locale),
      services.menu.listByBranch(targetSlug, locale),
      services.reviews.listForBranch(b.id, locale),
      services.reviews.getCacheStatus(b.id),
    ])

  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
  const dayLabels: Record<Locale, Record<(typeof dayKeys)[number], string>> = {
    en: {
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
    },
    he: {
      sun: "ראשון",
      mon: "שני",
      tue: "שלישי",
      wed: "רביעי",
      thu: "חמישי",
      fri: "שישי",
      sat: "שבת",
    },
    ru: {
      sun: "Воскресенье",
      mon: "Понедельник",
      tue: "Вторник",
      wed: "Среда",
      thu: "Четверг",
      fri: "Пятница",
      sat: "Суббота",
    },
    ar: {
      sun: "الأحد",
      mon: "الإثنين",
      tue: "الثلاثاء",
      wed: "الأربعاء",
      thu: "الخميس",
      fri: "الجمعة",
      sat: "السبت",
    },
  }

  const labels = dayLabels[locale] ?? dayLabels[FALLBACK_LOCALE]
  const hoursByDay = new Map(hoursRows.map((h) => [h.dayOfWeek, h]))
  const hours: SiteHours[] = dayKeys.map((key, idx) => {
    const row = hoursByDay.get(idx)
    return {
      day: labels[key],
      open: row?.openTime ?? "",
      close: row?.closeTime ?? "",
      isClosed: row?.isClosed ?? !row,
    }
  })

  const fmt = (cents: number) => services.formatAmount(cents, locale)

  const sitePrices: SitePriceRow[] = prices.data.map((p) => ({
    label: p.label ?? "",
    weekday: fmt(p.weekdayAmountCents),
    weekend: fmt(p.weekendAmountCents),
  }))

  const sitePackages: SitePackage[] = packages.data.map((p) => ({
    title: p.title ?? "",
    price: fmt(p.amountCents),
    perks: p.perks ?? "",
  }))

  const siteEvents: SiteEvent[] = events.data.map((e) => ({
    title: e.title ?? "",
    description: e.description ?? "",
    image: e.image?.blobUrl ?? null,
  }))

  const siteMenu: SiteMenuCategory[] = menu.data.map((cat) => ({
    title: cat.title ?? "",
    items: cat.items.map((item) => ({
      name: item.name ?? "",
      price: fmt(item.amountCents),
      tag: item.tag,
    })),
  }))

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const siteReviews: SiteReview[] = reviews.slice(0, 6).map((r) => ({
    author: r.authorName,
    rating: r.rating,
    date: dateFormatter.format(r.publishedAt),
    text: r.text ?? "",
  }))

  const profileUrl = b.googlePlaceId
    ? `https://search.google.com/local/reviews?placeid=${b.googlePlaceId}`
    : b.mapUrl

  return {
    id: b.id,
    slug: b.slug,
    displayName: b.displayName ?? b.slug,
    shortName: b.shortName ?? b.slug,
    address: b.address ?? "",
    city: b.city ?? "",
    phone: b.phone,
    whatsapp: b.whatsapp,
    email: b.email,
    mapUrl: b.mapUrl,
    geo: { lat: b.latitude, lng: b.longitude },
    hours,
    hero: {
      image: b.heroImage?.blobUrl ?? null,
      headline: b.heroHeadline ?? b.displayName ?? b.slug,
      tagline: b.heroTagline ?? "",
    },
    prices: sitePrices,
    packages: sitePackages,
    events: siteEvents,
    menu: siteMenu,
    google: {
      rating: reviewCache?.averageRating ?? 0,
      count: reviewCache?.totalRatingCount ?? 0,
      profileUrl,
      reviews: siteReviews,
    },
    seo: {
      title: b.seoTitle ?? b.displayName ?? b.slug,
      description: b.seoDescription ?? b.heroTagline ?? "",
    },
  }
}

export { FALLBACK_LOCALE }
