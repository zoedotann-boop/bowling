import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Resend } from "resend"

import { db } from "@/lib/db"
import { eventType, lead, location } from "@/lib/db/schema"
import { BRANCH_COOKIE } from "@/lib/branches"

// Payload posted by the event BookingForm (components/pages/event-detail-page.tsx).
// The built-in form sends the fixed keys below; an admin-defined dynamic form
// sends its own field keys, captured by the index signature.
interface BookingPayload {
  event?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  upgrades?: string[]
  // A "data:image/png;base64,..." data URL of the hand-drawn signature.
  signature?: string
  [key: string]: unknown
}

// Hebrew labels for the built-in fields; dynamic fields fall back to their key.
const FIELD_LABELS: Record<string, string> = {
  event: "אירוע",
  firstName: "שם פרטי",
  lastName: "שם משפחה",
  idNumber: "ת.ז",
  celebrants: "שמות החוגגים",
  email: "אימייל",
  phone: "טלפון",
  date: "תאריך",
}

const RESERVED_KEYS = new Set(["signature", "upgrades"])

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] as string
  )

// The textual answers, in payload order (event first), excluding control keys.
function answers(payload: BookingPayload): [string, string][] {
  return Object.entries(payload)
    .filter(
      ([key, value]) =>
        !RESERVED_KEYS.has(key) &&
        typeof value === "string" &&
        value.trim() !== ""
    )
    .map(([key, value]) => [key, value as string])
}

function renderEmail(payload: BookingPayload) {
  const rows = answers(payload)
    .map(
      ([key, value]) => `<tr>
          <td style="padding:6px 12px;font-weight:700;color:#0f172a;white-space:nowrap;">${escapeHtml(FIELD_LABELS[key] ?? key)}</td>
          <td style="padding:6px 12px;color:#334155;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("")

  const upgrades = payload.upgrades?.length
    ? `<ul style="margin:4px 0;padding-inline-start:20px;color:#334155;">${payload.upgrades
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    : "—"

  const signatureNote = payload.signature
    ? `<h3 style="margin:18px 0 4px;">חתימה</h3>
       <p style="margin:0;color:#334155;">מצורפת כקובץ signature.png.</p>`
    : ""

  return `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#0f172a;">
      <h2 style="margin:0 0 12px;">טופס אישור אירוע חדש</h2>
      <table style="border-collapse:collapse;width:100%;border:1px solid #e2e8f0;">
        ${rows}
      </table>
      <h3 style="margin:18px 0 4px;">שדרוגים שנבחרו</h3>
      ${upgrades}
      ${signatureNote}
    </div>`
}

// Resolves the active branch/event type (best-effort) and stores the lead. The
// branch cookie maps to a location slug; the payload `event` maps to an event
// type slug within it. Anything unresolved is stored as null.
async function persistLead(payload: BookingPayload) {
  const cookieStore = await cookies()
  const branchSlug = cookieStore.get(BRANCH_COOKIE)?.value

  const loc = branchSlug
    ? await db.query.location.findFirst({
        where: eq(location.slug, branchSlug),
        columns: { id: true },
      })
    : undefined

  const type =
    loc && payload.event
      ? await db.query.eventType.findFirst({
          where: and(
            eq(eventType.locationId, loc.id),
            eq(eventType.slug, payload.event)
          ),
          columns: { id: true },
        })
      : undefined

  // Everything except the promoted columns and control keys becomes formData
  // (idNumber, celebrants, date and any admin-defined dynamic fields). `event`
  // is captured via eventTypeId; the signature has its own column.
  const { firstName, lastName, email, phone, upgrades, signature, ...rest } =
    payload
  delete rest.event
  await db.insert(lead).values({
    locationId: loc?.id ?? null,
    eventTypeId: type?.id ?? null,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    email: email ?? null,
    phone: phone ?? null,
    selectedUpgrades: upgrades ?? [],
    signatureUrl: signature ?? null,
    formData: rest,
  })
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  const to = process.env.EVENTS_TO_EMAIL

  if (!apiKey || !from || !to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    )
  }

  let payload: BookingPayload
  try {
    payload = (await request.json()) as BookingPayload
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }

  // The form config (built-in or admin-defined) enforces per-field requirements
  // in the browser; here we only guard against an empty submission.
  if (answers(payload).length === 0) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    )
  }

  const { email, firstName, lastName, signature } = payload

  // Best-effort: persist the submission as a lead so it shows in the admin.
  // Never let a DB hiccup block the confirmation email.
  await persistLead(payload).catch(() => {})

  const resend = new Resend(apiKey)
  const name = [firstName, lastName].filter(Boolean).join(" ")

  // Attach the signature PNG when one was provided.
  const attachments = signature
    ? [
        {
          filename: "signature.png",
          content: Buffer.from(
            signature.replace(/^data:image\/png;base64,/, ""),
            "base64"
          ),
        },
      ]
    : undefined

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email || undefined,
    subject: `טופס אירוע חדש · ${payload.event ?? ""} · ${name || email || ""}`,
    html: renderEmail(payload),
    attachments,
  })

  if (error) {
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
