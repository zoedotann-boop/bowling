import { NextResponse } from "next/server"

import {
  resolveActiveBranch,
  resolveInquiriesRecipient,
  sendMail,
} from "@/lib/email"
import {
  BRAND_HE,
  bulletList,
  detailTable,
  emailShell,
  noteParagraph,
  sectionHeading,
} from "@/lib/email-template"
import type { Branch } from "@/lib/branches"

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

// The textual answers, in payload order (event first), excluding control keys.
function answers(payload: BookingPayload): [string, string][] {
  return Object.entries(payload)
    .filter(
      ([key, value]) =>
        !RESERVED_KEYS.has(key) &&
        typeof value === "string" &&
        value.trim() !== ""
    )
    .map(([key, value]) => [FIELD_LABELS[key] ?? key, value as string])
}

// Shared body: the answers table, chosen upgrades and an optional signature note.
function renderBody(payload: BookingPayload, signatureNote: string): string {
  const upgrades = payload.upgrades?.length
    ? sectionHeading("שדרוגים שנבחרו") + bulletList(payload.upgrades)
    : ""
  const signature = payload.signature ? signatureNote : ""
  return detailTable(answers(payload)) + upgrades + signature
}

// The email the venue team receives for each new event submission.
function renderManagerEmail(payload: BookingPayload, branch: Branch): string {
  return emailShell({
    branch,
    preheader: `טופס אירוע חדש · ${payload.event ?? ""}`,
    heading: "טופס אישור אירוע חדש",
    intro: "התקבל טופס אירוע חדש דרך האתר.",
    body: renderBody(
      payload,
      sectionHeading("חתימה") +
        noteParagraph("החתימה מצורפת כקובץ signature.png.")
    ),
  })
}

// The confirmation the customer receives after submitting the booking form.
function renderCustomerEmail(
  payload: BookingPayload,
  branch: Branch,
  name: string
): string {
  return emailShell({
    branch,
    preheader: "קיבלנו את בקשת האירוע שלך ונחזור אליך לתיאום",
    heading: "הבקשה שלך התקבלה!",
    intro: `היי ${name}, תודה שבחרת ב${BRAND_HE}! קיבלנו את פרטי האירוע שלך וניצור איתך קשר בהקדם לתיאום הסופי. להלן סיכום הפרטים שנשלחו.`,
    body: renderBody(
      payload,
      sectionHeading("חתימה") + noteParagraph("חתימתך נקלטה בהצלחה.")
    ),
  })
}

export async function POST(request: Request) {
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

  const [to, branch] = await Promise.all([
    resolveInquiriesRecipient(),
    resolveActiveBranch(),
  ])
  if (!to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    )
  }

  const { email, firstName, lastName, signature } = payload
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

  // The venue notification is the critical send; its failure fails the request.
  const result = await sendMail({
    to,
    replyTo: email || undefined,
    subject: `טופס אירוע חדש · ${payload.event ?? ""} · ${name || email || ""}`,
    html: renderManagerEmail(payload, branch),
    attachments,
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  // Best-effort confirmation to the customer; never blocks the response.
  if (email?.trim()) {
    await sendMail({
      to: email.trim(),
      subject: `קיבלנו את בקשת האירוע שלך · ${BRAND_HE}`,
      html: renderCustomerEmail(payload, branch, name || email.trim()),
    })
  }

  return NextResponse.json({ ok: true })
}
