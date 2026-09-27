import { NextResponse } from "next/server"

import { escapeHtml, resolveInquiriesRecipient, sendMail } from "@/lib/email"

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

  const to = await resolveInquiriesRecipient()
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

  const result = await sendMail({
    to,
    replyTo: email || undefined,
    subject: `טופס אירוע חדש · ${payload.event ?? ""} · ${name || email || ""}`,
    html: renderEmail(payload),
    attachments,
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  return NextResponse.json({ ok: true })
}
