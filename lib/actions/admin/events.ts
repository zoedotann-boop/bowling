"use server"

import { eq, inArray } from "drizzle-orm"
import { refresh } from "next/cache"

import { requireLocationAccess } from "@/lib/admin/access"
import { db } from "@/lib/db"
import {
  eventFormField,
  eventPackageLine,
  eventStep,
  eventType,
  eventTypeContent,
  eventUpgrade,
} from "@/lib/db/schema"

import { eventsSchema } from "./schemas"
import { type ActionResult, OK, readSlug } from "./shared"
import { ownedIds, syncRows, upsert, withIds } from "./sync"

export async function saveEvents(input: unknown): Promise<ActionResult> {
  const { location: loc } = await requireLocationAccess(
    readSlug(input),
    "content"
  )
  const locationId = loc.id

  const parsed = eventsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid" }
  const data = parsed.data

  const slugs = data.eventTypes.map((type) => type.slug)
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "slug-taken" }
  }
  for (const type of data.eventTypes) {
    const keys = type.formFields.map((field) => field.key)
    if (new Set(keys).size !== keys.length) {
      return { ok: false, error: "duplicate-field-key" }
    }
  }

  await db.transaction(async (tx) => {
    const scope = eq(eventType.locationId, locationId)
    const types = withIds(data.eventTypes, await ownedIds(tx, eventType, scope))
    const typeIds = types.map((type) => type.id)
    const children = <T extends { id?: string }>(
      pick: (type: (typeof types)[number]) => T[]
    ) =>
      types.flatMap((type) =>
        withIds(pick(type)).map((row) => ({ ...row, eventTypeId: type.id }))
      )

    await syncRows(
      tx,
      eventType,
      scope,
      types.map(({ id, slug, name, isVisible, sortOrder }) => ({
        id,
        locationId,
        slug,
        name,
        isVisible,
        sortOrder,
      }))
    )
    await upsert(
      tx,
      eventTypeContent,
      eventTypeContent.eventTypeId,
      types.map((type) => ({
        eventTypeId: type.id,
        ...type.content,
        heroImageUrl: type.content.heroImageUrl || null,
      }))
    )

    await syncRows(
      tx,
      eventStep,
      inArray(eventStep.eventTypeId, typeIds),
      children((type) => type.steps)
    )
    await syncRows(
      tx,
      eventPackageLine,
      inArray(eventPackageLine.eventTypeId, typeIds),
      children((type) => type.packageLines)
    )
    await syncRows(
      tx,
      eventUpgrade,
      inArray(eventUpgrade.eventTypeId, typeIds),
      children((type) => type.upgrades)
    )
    await syncRows(
      tx,
      eventFormField,
      inArray(eventFormField.eventTypeId, typeIds),
      children((type) => type.formFields)
    )
  })

  refresh()
  return OK
}
