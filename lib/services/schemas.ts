import { z } from "zod"

import { routing, type Locale } from "@/i18n/routing"

const localeSet = new Set<string>(routing.locales)

export const localeSchema = z
  .string()
  .refine((v): v is Locale => localeSet.has(v), {
    message: "unsupported locale",
  })

const timeStringSchema = z
  .string()
  .regex(/^[0-2]\d:[0-5]\d$/, { message: "time must be HH:MM" })

const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be kebab-case",
  })

const nonEmpty = z.string().min(1)

// ---------- Branch ----------

export const createBranchSchema = z.object({
  slug: slugSchema,
  phone: nonEmpty,
  whatsapp: nonEmpty,
  email: z.string().email(),
  mapUrl: z.string().url(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heroImageId: z.string().nullish(),
  googlePlaceId: z.string().nullish(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export const updateBranchSchema = createBranchSchema.partial().extend({
  id: nonEmpty,
})

export const reorderSchema = z
  .array(z.object({ id: nonEmpty, sortOrder: z.number().int() }))
  .min(1)

// ---------- Branch translation ----------

export const upsertBranchTranslationSchema = z.object({
  branchId: nonEmpty,
  locale: localeSchema,
  displayName: z.string().nullish(),
  shortName: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  heroHeadline: z.string().nullish(),
  heroTagline: z.string().nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Branch domain ----------

const hostRegex =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/

const hostSchema = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .transform((v) => v.toLowerCase())
  .refine((v) => hostRegex.test(v), {
    message: "host must be a valid domain (letters, digits, dots, hyphens)",
  })

export const createBranchDomainSchema = z.object({
  branchId: nonEmpty,
  host: hostSchema,
})

export const removeBranchDomainSchema = z.object({
  id: nonEmpty,
  branchId: nonEmpty,
})

// ---------- Opening hours ----------

export const openingHoursRowSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: timeStringSchema.nullable(),
    closeTime: timeStringSchema.nullable(),
    isClosed: z.boolean(),
  })
  .refine(
    (v) =>
      (v.isClosed && v.openTime === null && v.closeTime === null) ||
      (!v.isClosed && v.openTime !== null && v.closeTime !== null),
    {
      message: "closed days must have null open/close; open days require both",
    }
  )

export const bulkHoursSchema = z
  .array(openingHoursRowSchema)
  .length(7)
  .refine((rows) => new Set(rows.map((r) => r.dayOfWeek)).size === 7, {
    message: "each day of week must appear exactly once",
  })

// ---------- Price row ----------

export const priceKindSchema = z.enum(["hourly", "adult", "child", "shoe"])

export const createPriceRowSchema = z.object({
  branchId: nonEmpty,
  kind: priceKindSchema,
  weekdayAmountCents: z.number().int().nonnegative(),
  weekendAmountCents: z.number().int().nonnegative(),
  sortOrder: z.number().int().optional(),
})

export const updatePriceRowSchema = createPriceRowSchema.partial().extend({
  id: nonEmpty,
})

export const upsertPriceRowTranslationSchema = z.object({
  priceRowId: nonEmpty,
  locale: localeSchema,
  label: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Offering package ----------

export const createOfferingPackageSchema = z.object({
  branchId: nonEmpty,
  amountCents: z.number().int().nonnegative(),
  sortOrder: z.number().int().optional(),
})

export const updateOfferingPackageSchema = createOfferingPackageSchema
  .partial()
  .extend({ id: nonEmpty })

export const upsertOfferingPackageTranslationSchema = z.object({
  packageId: nonEmpty,
  locale: localeSchema,
  title: z.string().nullish(),
  perks: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Event offering ----------

export const createEventOfferingSchema = z.object({
  branchId: nonEmpty,
  imageId: z.string().nullish(),
  sortOrder: z.number().int().optional(),
})

export const updateEventOfferingSchema = createEventOfferingSchema
  .partial()
  .extend({ id: nonEmpty })

export const upsertEventOfferingTranslationSchema = z.object({
  eventOfferingId: nonEmpty,
  locale: localeSchema,
  title: z.string().nullish(),
  description: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Menu category ----------

export const createMenuCategorySchema = z.object({
  branchId: nonEmpty,
  sortOrder: z.number().int().optional(),
})

export const updateMenuCategorySchema = createMenuCategorySchema
  .partial()
  .extend({ id: nonEmpty })

export const upsertMenuCategoryTranslationSchema = z.object({
  menuCategoryId: nonEmpty,
  locale: localeSchema,
  title: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Menu item ----------

export const createMenuItemSchema = z.object({
  categoryId: nonEmpty,
  amountCents: z.number().int().nonnegative(),
  sortOrder: z.number().int().optional(),
})

export const updateMenuItemSchema = createMenuItemSchema.partial().extend({
  id: nonEmpty,
})

export const upsertMenuItemTranslationSchema = z.object({
  menuItemId: nonEmpty,
  locale: localeSchema,
  name: z.string().nullish(),
  tag: z.string().nullish(),
  aiGenerated: z.boolean().optional(),
  aiGeneratedAt: z.date().nullish(),
  reviewedAt: z.date().nullish(),
})

// ---------- Media ----------

export const createMediaAssetSchema = z.object({
  branchId: nonEmpty,
  blobUrl: z.string().url(),
  filename: z.string().nullish(),
  contentType: z.string().nullish(),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
  sizeBytes: z.number().int().positive().nullish(),
  uploadedBy: z.string().nullish(),
  altTextHe: z.string().nullish(),
  altTextEn: z.string().nullish(),
  altTextRu: z.string().nullish(),
  altTextAr: z.string().nullish(),
})

export const updateMediaAltTextSchema = z.object({
  id: nonEmpty,
  altTextHe: z.string().nullish(),
  altTextEn: z.string().nullish(),
  altTextRu: z.string().nullish(),
  altTextAr: z.string().nullish(),
})

// ---------- Footer link ----------

const hrefSchema = z.string().min(1).max(500)

export const createFooterLinkSchema = z.object({
  branchId: nonEmpty,
  locale: localeSchema,
  groupKey: nonEmpty,
  label: nonEmpty,
  href: hrefSchema,
  sortOrder: z.number().int().optional(),
})

export const updateFooterLinkSchema = createFooterLinkSchema.partial().extend({
  id: nonEmpty,
})

// ---------- Legal page ----------

export const upsertLegalPageSchema = z.object({
  branchId: nonEmpty,
  slug: slugSchema,
  titleHe: z.string().nullish(),
  titleEn: z.string().nullish(),
  titleRu: z.string().nullish(),
  titleAr: z.string().nullish(),
  bodyMarkdownHe: z.string().nullish(),
  bodyMarkdownEn: z.string().nullish(),
  bodyMarkdownRu: z.string().nullish(),
  bodyMarkdownAr: z.string().nullish(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})
