import { NextResponse } from "next/server"

import { resolveBranch, resolveInquiriesRecipient, sendMail } from "@/lib/email"
import { BRAND_HE, detailTable, emailShell } from "@/lib/email-template"
import type { Branch } from "@/lib/branches"

interface ContactPayload {
  branch?: string
  name?: string
  phone?: string
  email?: string
  topic?: string
  message?: string
}

function detailRows(payload: ContactPayload): [string, string][] {
  return (
    [
      ["שם", payload.name],
      ["טלפון", payload.phone],
      ["אימייל", payload.email],
      ["נושא", payload.topic],
      ["הודעה", payload.message],
    ] as const
  )
    .filter(([, value]) => value?.trim())
    .map(([label, value]) => [label, value!.trim()])
}

function renderManagerEmail(payload: ContactPayload, branch: Branch): string {
  return emailShell({
    branch,
    preheader: `פנייה חדשה מ${payload.name ?? ""}`,
    heading: "פנייה חדשה מטופס יצירת קשר",
    intro: "התקבלה פנייה חדשה דרך טופס יצירת הקשר באתר.",
    body: detailTable(detailRows(payload)),
  })
}

function renderCustomerEmail(payload: ContactPayload, branch: Branch): string {
  const summary = detailRows(payload).filter(([label]) =>
    ["נושא", "הודעה"].includes(label)
  )
  return emailShell({
    branch,
    preheader: "קיבלנו את הפנייה שלך ונחזור אליך בהקדם",
    heading: "תודה שפנית אלינו!",
    intro: `היי ${payload.name ?? ""}, קיבלנו את הפנייה שלך ואנחנו כבר על זה. נחזור אליך בהקדם בימי הפעילות. בינתיים אפשר גם להתקשר או לכתוב לנו בוואטסאפ.`,
    body: detailTable(summary),
  })
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

  const { name, phone, email } = payload
  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    )
  }

  const branch = await resolveBranch(payload.branch)
  const to = await resolveInquiriesRecipient(payload.branch)
  if (!to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    )
  }

  const result = await sendMail({
    to,
    replyTo: email?.trim() || undefined,
    subject: `פנייה חדשה · ${payload.topic ?? ""} · ${name}`,
    html: renderManagerEmail(payload, branch),
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  if (email?.trim()) {
    await sendMail({
      to: email.trim(),
      subject: `קיבלנו את הפנייה שלך · ${BRAND_HE}`,
      html: renderCustomerEmail(payload, branch),
    })
  }

  return NextResponse.json({ ok: true })
}
