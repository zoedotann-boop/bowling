"use server"

import { eq } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import { location, siteContent } from "@/lib/db/schema"

import { generalSchema } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"
import { upsert } from "./sync"

export async function saveGeneral(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "settings"
  )

  const parsed = generalSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  await db.transaction(async (tx) => {
    await tx
      .update(location)
      .set({
        name: data.name,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        addressFull: data.addressFull,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        inquiriesEmail: data.inquiriesEmail,
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

    await upsert(tx, siteContent, siteContent.locationId, [
      { locationId: loc.id, footerNote: data.footerNote },
    ])
  })

  refresh()
  return OK
}
