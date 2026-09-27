import { NextResponse } from "next/server"

import { escapeHtml, resolveInquiriesRecipient, sendMail } from "@/lib/email"

// Payload posted by the public contact form (components/home/contact.tsx).
interface ContactPayload {
  name?: string
  phone?: string
  topic?: string
  message?: string
}

function renderEmail(payload: ContactPayload) {
  const row = (label: string, value?: string) =>
    value
      ? `<tr>
          <td style="padding:6px 12px;font-weight:700;color:#0f172a;white-space:nowrap;">${label}</td>
          <td style="padding:6px 12px;color:#334155;">${escapeHtml(value)}</td>
        </tr>`
      : ""

  return `
    <div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#0f172a;">
      <h2 style="margin:0 0 12px;">פנייה חדשה מטופס יצירת קשר</h2>
      <table style="border-collapse:collapse;width:100%;border:1px solid #e2e8f0;">
        ${row("שם", payload.name)}
        ${row("טלפון", payload.phone)}
        ${row("נושא", payload.topic)}
        ${row("הודעה", payload.message)}
      </table>
    </div>`
}

export async function POST(request: Request) {
  let payload: ContactPayload
  try {
    payload = (await request.json()) as ContactPayload
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }

  const { name, phone } = payload
  if (!name?.trim() || !phone?.trim()) {
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

  const result = await sendMail({
    to,
    subject: `פנייה חדשה · ${payload.topic ?? ""} · ${name}`,
    html: renderEmail(payload),
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  return NextResponse.json({ ok: true })
}
