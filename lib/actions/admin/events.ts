"use server"

import { eq } from "drizzle-orm"

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

import { eventsSchema, type EventTypeDraft } from "./schemas"
import { type ActionResult, OK, syncCollection } from "./shared"

// Saves all event types for a location. Each event type owns a content
// singleton plus four reorderable collections. Same two-level pattern as the
// menu, with manual uniqueness checks (zod can't express uniqueness across an
// array) for event-type slugs and per-type form-field keys.
export async function saveEvents(input: unknown): Promise<ActionResult> {
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

  const { location: loc } = await requireLocationAccess(data.slug, "content")
  const locationId = loc.id

  const existing = await db.query.eventType.findMany({
    where: eq(eventType.locationId, locationId),
    columns: { id: true },
  })
  const keptIds = new Set(
    data.eventTypes.map((type) => type.id).filter(Boolean)
  )
  for (const type of existing) {
    if (!keptIds.has(type.id)) {
      await db.delete(eventType).where(eq(eventType.id, type.id))
    }
  }

  for (const [sortOrder, type] of data.eventTypes.entries()) {
    let eventTypeId: string
    if (type.id) {
      await db
        .update(eventType)
        .set({
          slug: type.slug,
          name: type.name,
          isVisible: type.isVisible,
          sortOrder,
        })
        .where(eq(eventType.id, type.id))
      eventTypeId = type.id
    } else {
      const [inserted] = await db
        .insert(eventType)
        .values({
          locationId,
          slug: type.slug,
          name: type.name,
          isVisible: type.isVisible,
          sortOrder,
        })
        .returning({ id: eventType.id })
      eventTypeId = inserted.id
    }

    await saveEventTypeChildren(eventTypeId, type)
  }

  return OK
}

async function saveEventTypeChildren(
  eventTypeId: string,
  type: EventTypeDraft
): Promise<void> {
  const contentValues = {
    heroTitle: type.content.heroTitle,
    heroDescription: type.content.heroDescription,
    packageAmount: type.content.packageAmount,
    packageChildrenCount: type.content.packageChildrenCount,
    extraChildAmount: type.content.extraChildAmount,
    depositAmount: type.content.depositAmount,
    formIntro: type.content.formIntro,
    formTerms: type.content.formTerms,
    requiresSignature: type.content.requiresSignature,
  }
  await db
    .insert(eventTypeContent)
    .values({ eventTypeId, ...contentValues })
    .onConflictDoUpdate({
      target: eventTypeContent.eventTypeId,
      set: contentValues,
    })

  const steps = await db.query.eventStep.findMany({
    where: eq(eventStep.eventTypeId, eventTypeId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: steps.map((row) => row.id),
    incoming: type.steps.map((row, order) => ({ ...row, sortOrder: order })),
    insert: async (row) => {
      await db.insert(eventStep).values({
        eventTypeId,
        title: row.title,
        description: row.description,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(eventStep)
        .set({
          title: row.title,
          description: row.description,
          sortOrder: row.sortOrder,
        })
        .where(eq(eventStep.id, id))
    },
    remove: async (id) => {
      await db.delete(eventStep).where(eq(eventStep.id, id))
    },
  })

  const lines = await db.query.eventPackageLine.findMany({
    where: eq(eventPackageLine.eventTypeId, eventTypeId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: lines.map((row) => row.id),
    incoming: type.packageLines.map((row, order) => ({
      ...row,
      sortOrder: order,
    })),
    insert: async (row) => {
      await db.insert(eventPackageLine).values({
        eventTypeId,
        label: row.label,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(eventPackageLine)
        .set({ label: row.label, sortOrder: row.sortOrder })
        .where(eq(eventPackageLine.id, id))
    },
    remove: async (id) => {
      await db.delete(eventPackageLine).where(eq(eventPackageLine.id, id))
    },
  })

  const upgrades = await db.query.eventUpgrade.findMany({
    where: eq(eventUpgrade.eventTypeId, eventTypeId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: upgrades.map((row) => row.id),
    incoming: type.upgrades.map((row, order) => ({ ...row, sortOrder: order })),
    insert: async (row) => {
      await db.insert(eventUpgrade).values({
        eventTypeId,
        label: row.label,
        amount: row.amount,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(eventUpgrade)
        .set({ label: row.label, amount: row.amount, sortOrder: row.sortOrder })
        .where(eq(eventUpgrade.id, id))
    },
    remove: async (id) => {
      await db.delete(eventUpgrade).where(eq(eventUpgrade.id, id))
    },
  })

  const fields = await db.query.eventFormField.findMany({
    where: eq(eventFormField.eventTypeId, eventTypeId),
    columns: { id: true },
  })
  await syncCollection({
    existingIds: fields.map((row) => row.id),
    incoming: type.formFields.map((row, order) => ({
      ...row,
      sortOrder: order,
    })),
    insert: async (row) => {
      await db.insert(eventFormField).values({
        eventTypeId,
        key: row.key,
        label: row.label,
        placeholder: row.placeholder,
        type: row.type,
        options: row.options,
        minValue: row.minValue,
        maxValue: row.maxValue,
        isRequired: row.isRequired,
        isVisible: row.isVisible,
        sortOrder: row.sortOrder,
      })
    },
    update: async (id, row) => {
      await db
        .update(eventFormField)
        .set({
          key: row.key,
          label: row.label,
          placeholder: row.placeholder,
          type: row.type,
          options: row.options,
          minValue: row.minValue,
          maxValue: row.maxValue,
          isRequired: row.isRequired,
          isVisible: row.isVisible,
          sortOrder: row.sortOrder,
        })
        .where(eq(eventFormField.id, id))
    },
    remove: async (id) => {
      await db.delete(eventFormField).where(eq(eventFormField.id, id))
    },
  })
}
