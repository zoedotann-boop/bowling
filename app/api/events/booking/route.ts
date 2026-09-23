import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Resend } from "resend"

import { db } from "@/lib/db"
import { eventType, lead, location } from "@/lib/db/schema"
import { BRANCH_COOKIE } from "@/lib/branches"

// Payload posted by the event BookingForm (components/pages/event-detail-page.tsx).
interface BookingPayload {
  event?: string
  firstName?: string
  lastName?: string
  idNumber?: string
  celebrants?: string
  email?: string
  phone?: string
  date?: string
  upgrades?: string[]
  // A "data:image/png;base64,..." data URL of the hand-drawn signature.
  signature?: string
}

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

function renderEmail(payload: BookingPayload) {
  const row = (label: string, value?: string) =>
    value
      ? `<tr>
          <td style="padding:6px 12px;font-weight:700;color:#0f172a;white-space:nowrap;">${label}</td>
          <td style="padding:6px 12px;color:#334155;">${escapeHtml(value)}</td>
        </tr>`
      : ""

  const upgrades = payload.upgrades?.length
    ? `<ul style="margin:4px 0;padding-inline-start:20px;color:#334155;">${payload.upgrades
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`
    : "—"

  return `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#0f172a;">
      <h2 style="margin:0 0 12px;">טופס אישור אירוע חדש</h2>
      <table style="border-collapse:collapse;width:100%;border:1px solid #e2e8f0;">
        ${row("אירוע", payload.event)}
        ${row("שם פרטי", payload.firstName)}
        ${row("שם משפחה", payload.lastName)}
        ${row("ת.ז", payload.idNumber)}
        ${row("שמות החוגגים", payload.celebrants)}
        ${row("אימייל", payload.email)}
        ${row("טלפון", payload.phone)}
        ${row("תאריך", payload.date)}
      </table>
      <h3 style="margin:18px 0 4px;">שדרוגים שנבחרו</h3>
      ${upgrades}
      <h3 style="margin:18px 0 4px;">חתימה</h3>
      <p style="margin:0;color:#334155;">מצורפת כקובץ signature.png.</p>
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

  const { firstName, lastName, email, phone, upgrades, ...rest } = payload
  await db.insert(lead).values({
    locationId: loc?.id ?? null,
    eventTypeId: type?.id ?? null,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    email: email ?? null,
    phone: phone ?? null,
    selectedUpgrades: upgrades ?? [],
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

  const { firstName, lastName, email, phone, signature } = payload
  if (!firstName || !lastName || !email || !phone || !signature) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    )
  }

  // Best-effort: persist the submission as a lead so it shows in the admin.
  // Never let a DB hiccup block the confirmation email.
  await persistLead(payload).catch(() => {})

  // Turn the signature data URL into a PNG attachment.
  const base64 = signature.replace(/^data:image\/png;base64,/, "")
  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `טופס אירוע חדש · ${payload.event ?? ""} · ${firstName} ${lastName}`,
    html: renderEmail(payload),
    attachments: [
      { filename: "signature.png", content: Buffer.from(base64, "base64") },
    ],
  })

  if (error) {
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
