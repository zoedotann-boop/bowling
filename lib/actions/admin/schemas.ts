import { z } from "zod"

import { ADMIN_ROLES } from "@/lib/admin/permissions"
import { FORM_FIELD_TYPES } from "@/lib/events/fields"

import { localizedSchema, rowIdSchema } from "./shared"

const optionalMoney = z.number().int().nonnegative().nullable()

const adminLocationSchema = z.object({
  id: rowIdSchema,
  slug: z.string().min(1),
  name: localizedSchema,
  isVisible: z.boolean(),
})
export const locationsSchema = z.object({
  locations: z.array(adminLocationSchema),
})
export type LocationsDraft = z.infer<typeof locationsSchema>

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.enum(ADMIN_ROLES),
  locationIds: z.array(z.uuid()),
})
export type TeamMemberDraft = z.infer<typeof teamMemberSchema>

export const newTeamMemberSchema = teamMemberSchema.extend({
  email: z.string().trim().toLowerCase().pipe(z.email()),
})
export type NewTeamMemberDraft = z.infer<typeof newTeamMemberSchema>

const dayHoursSchema = z.object({
  day: z.number().int().min(0).max(6),
  closed: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
})

export const generalSchema = z.object({
  slug: z.string(),
  name: localizedSchema,
  addressLine1: localizedSchema,
  addressLine2: localizedSchema,
  addressFull: localizedSchema,
  laneDesc: localizedSchema,
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  inquiriesEmail: z.string(),
  wazeUrl: z.string(),
  logoUrl: z.string(),
  lanes: z.number().int().nonnegative(),
  hasGymboree: z.boolean(),
  hasNotice: z.boolean(),
  noticeTitle: localizedSchema,
  noticeBody: localizedSchema,
  hours: z.array(dayHoursSchema),
  seoTitle: localizedSchema,
  seoDescription: localizedSchema,
  contactTitle: localizedSchema,
  contactIntro: localizedSchema,
  footerNote: localizedSchema,
})
export type GeneralDraft = z.infer<typeof generalSchema>

export const legalSchema = z.object({
  slug: z.string(),
  terms: localizedSchema,
  accessibility: localizedSchema,
})
export type LegalDraft = z.infer<typeof legalSchema>

const homeFeatureSchema = z.object({
  id: rowIdSchema,
  icon: z.string(),
  label: localizedSchema,
  description: localizedSchema,
})
const homeServiceSchema = z.object({
  id: rowIdSchema,
  title: localizedSchema,
  description: localizedSchema,
  imageUrl: z.string(),
})
const galleryImageSchema = z.object({
  id: rowIdSchema,
  imageUrl: z.string(),
  alt: localizedSchema,
})
const contactSubjectSchema = z.object({
  id: rowIdSchema,
  label: localizedSchema,
})

const pricingSchema = z.object({
  eyebrow: localizedSchema,
  title: localizedSchema,
  description: localizedSchema,
  weekdaysLabel: localizedSchema,
  weekdaysPrice: localizedSchema,
  weekendLabel: localizedSchema,
  weekendPrice: localizedSchema,
  thirdGameLabel: localizedSchema,
  thirdGameNote: localizedSchema,
  thirdGamePrice: localizedSchema,
  soldierTitle: localizedSchema,
  soldierNote: localizedSchema,
  birthdayEyebrow: localizedSchema,
  birthdayTitle: localizedSchema,
  birthdayDescription: localizedSchema,
  birthdayCtaLabel: localizedSchema,
})
export type PricingDraft = z.infer<typeof pricingSchema>

export const homeSchema = z.object({
  slug: z.string(),
  heroTitle: localizedSchema,
  heroSubtitle: localizedSchema,
  heroCtaLabel: localizedSchema,
  servicesTitle: localizedSchema,
  servicesIntro: localizedSchema,
  galleryTitle: localizedSchema,
  reviewsTitle: localizedSchema,
  aboutImageUrl: z.string(),
  contactTitle: localizedSchema,
  contactIntro: localizedSchema,
  pricing: pricingSchema,
  features: z.array(homeFeatureSchema),
  services: z.array(homeServiceSchema),
  gallery: z.array(galleryImageSchema),
  contactSubjects: z.array(contactSubjectSchema),
})
export type HomeDraft = z.infer<typeof homeSchema>

const reviewCurationSchema = z.object({
  id: z.uuid(),
  isPublished: z.boolean(),
})
export const reviewsSchema = z.object({
  slug: z.string(),
  googlePlaceId: z.string(),
  autoSync: z.boolean(),
  reviews: z.array(reviewCurationSchema),
})

export interface GoogleReviewDraft {
  id: string
  authorName: string
  rating: number
  text: string
  publishedAt: string
  isPublished: boolean
}

const menuItemSchema = z.object({
  id: rowIdSchema,
  name: localizedSchema,
  description: localizedSchema,
  amount: optionalMoney,
  isVisible: z.boolean(),
})
const menuCategorySchema = z.object({
  id: rowIdSchema,
  label: localizedSchema,
  isVisible: z.boolean(),
  items: z.array(menuItemSchema),
})
export const menuSchema = z.object({
  slug: z.string(),
  heading: localizedSchema,
  intro: localizedSchema,
  categories: z.array(menuCategorySchema),
})
export type MenuDraft = z.infer<typeof menuSchema>
export type MenuItemDraft = z.infer<typeof menuItemSchema>

const formFieldOptionSchema = z.object({
  value: z.string(),
  label: localizedSchema,
})
const eventFormFieldSchema = z.object({
  id: rowIdSchema,
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: localizedSchema,
  placeholder: localizedSchema,
  type: z.enum(FORM_FIELD_TYPES),
  options: z.array(formFieldOptionSchema),
  minValue: z.number().int().nullable(),
  maxValue: z.number().int().nullable(),
  isRequired: z.boolean(),
  isVisible: z.boolean(),
})
const eventStepSchema = z.object({
  id: rowIdSchema,
  title: localizedSchema,
  description: localizedSchema,
})
const eventPackageLineSchema = z.object({
  id: rowIdSchema,
  label: localizedSchema,
})
const eventUpgradeSchema = z.object({
  id: rowIdSchema,
  label: localizedSchema,
  amount: optionalMoney,
})
const eventPolicyItemSchema = z.object({
  title: localizedSchema,
  description: localizedSchema,
})
const eventTypeContentSchema = z.object({
  heroTitle: localizedSchema,
  heroDescription: localizedSchema,
  packageAmount: optionalMoney,
  packageChildrenCount: z.number().int().nonnegative().nullable(),
  extraChildAmount: optionalMoney,
  depositAmount: optionalMoney,
  allowedItems: z.array(localizedSchema),
  forbiddenItems: z.array(localizedSchema),
  rulesNote: localizedSchema,
  policyItems: z.array(eventPolicyItemSchema),
  policyNote: localizedSchema,
  formIntro: localizedSchema,
  formTerms: localizedSchema,
  formFootnote: localizedSchema,
  requiresSignature: z.boolean(),
})
const eventTypeSchema = z.object({
  id: rowIdSchema,
  slug: z.string(),
  name: localizedSchema,
  isVisible: z.boolean(),
  content: eventTypeContentSchema,
  steps: z.array(eventStepSchema),
  packageLines: z.array(eventPackageLineSchema),
  upgrades: z.array(eventUpgradeSchema),
  formFields: z.array(eventFormFieldSchema),
})
export const eventsSchema = z.object({
  slug: z.string(),
  eventTypes: z.array(eventTypeSchema),
})
export type EventsDraft = z.infer<typeof eventsSchema>
export type EventTypeDraft = z.infer<typeof eventTypeSchema>
export type EventFormFieldDraft = z.infer<typeof eventFormFieldSchema>
