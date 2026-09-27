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

interface BookingPayload {
  event?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  upgrades?: string[]
  signature?: string
  [key: string]: unknown
}

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

function renderBody(payload: BookingPayload, signatureNote: string): string {
  const upgrades = payload.upgrades?.length
    ? sectionHeading("שדרוגים שנבחרו") + bulletList(payload.upgrades)
    : ""
  const signature = payload.signature ? signatureNote : ""
  return detailTable(answers(payload)) + upgrades + signature
}

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
    html: renderManagerEmail(payload, branch),
    attachments,
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  if (email?.trim()) {
    await sendMail({
      to: email.trim(),
      subject: `קיבלנו את בקשת האירוע שלך · ${BRAND_HE}`,
      html: renderCustomerEmail(payload, branch, name || email.trim()),
    })
  }

  return NextResponse.json({ ok: true })
}
