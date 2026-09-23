"use server"

import { eq } from "drizzle-orm"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { location, siteContent } from "@/lib/db/schema"

import { generalSchema } from "./schemas"
import { type ActionResult, OK } from "./shared"

// Saves a location's core settings (contact, hours, SEO) plus its site chrome
// copy. Access gate → validate → update location row → upsert site content.
export async function saveGeneral(input: unknown): Promise<ActionResult> {
  const parsed = generalSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  const { location: loc } = await requireLocationAccess(data.slug, "settings")

  await db
    .update(location)
    .set({
      name: data.name,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      addressFull: data.addressFull,
      laneDesc: data.laneDesc,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      wazeUrl: data.wazeUrl,
      logoUrl: data.logoUrl || null,
      lanes: data.lanes,
      hasGymboree: data.hasGymboree,
      hasNotice: data.hasNotice,
      noticeTitle: data.noticeTitle,
      noticeBody: data.noticeBody,
      hours: data.hours,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    })
    .where(eq(location.id, loc.id))

  await db
    .insert(siteContent)
    .values({
      locationId: loc.id,
      contactTitle: data.contactTitle,
      contactIntro: data.contactIntro,
      footerNote: data.footerNote,
    })
    .onConflictDoUpdate({
      target: siteContent.locationId,
      set: {
        contactTitle: data.contactTitle,
        contactIntro: data.contactIntro,
        footerNote: data.footerNote,
      },
    })

  return OK
}
