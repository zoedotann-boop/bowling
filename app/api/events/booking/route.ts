import { NextResponse } from "next/server"

import { resolveBranch, resolveInquiriesRecipient, sendMail } from "@/lib/email"
import {
  BRAND_HE,
  detailTable,
  emailShell,
  noteParagraph,
  sectionHeading,
} from "@/lib/email-template"
import type { Branch } from "@/lib/branches"
import { bookingAnswers } from "@/lib/events/booking-answers"
import {
  loadAgreement,
  renderAgreement,
  SIGNATURE_CID,
} from "@/lib/events/booking-agreement"
import type { EventDetailTexts } from "@/lib/events/details"
import { birthdayInvitationAttachment } from "@/lib/invitations/birthday-invitation-pdf"

interface BookingPayload {
  branch?: string
  event?: string
  slug?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  signature?: string
  [key: string]: unknown
}

function renderManagerEmail(
  payload: BookingPayload,
  branch: Branch,
  agreement: EventDetailTexts
): string {
  return emailShell({
    branch,
    preheader: `טופס אירוע חדש · ${payload.event ?? ""}`,
    heading: "טופס אישור אירוע חדש",
    intro: "התקבל טופס אירוע חדש דרך האתר.",
    body:
      detailTable(bookingAnswers(payload)) +
      renderAgreement(agreement, Boolean(payload.signature)),
  })
}

function renderCustomerEmail(
  payload: BookingPayload,
  branch: Branch,
  name: string,
  hasInvitation: boolean
): string {
  return emailShell({
    branch,
    preheader: "קיבלנו את בקשת האירוע שלך ונחזור אליך לתיאום",
    heading: "הבקשה שלך התקבלה!",
    intro: `היי ${name}, תודה שבחרת ב${BRAND_HE}! קיבלנו את פרטי האירוע שלך וניצור איתך קשר בהקדם לתיאום הסופי. להלן סיכום הפרטים שנשלחו.`,
    body:
      detailTable(bookingAnswers(payload)) +
      (payload.signature
        ? sectionHeading("חתימה") + noteParagraph("חתימתך נקלטה בהצלחה.")
        : "") +
      (hasInvitation
        ? sectionHeading("הזמנה ליום ההולדת") +
          noteParagraph(
            "צירפנו למייל הזמנה מעוצבת (PDF) עם התאריך שביקשת. אפשר לשלוח אותה לאורחים אחרי שנאשר איתך את המועד."
          )
        : ""),
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

  if (bookingAnswers(payload).length === 0) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    )
  }

  const branch = resolveBranch(payload.branch)
  const to = await resolveInquiriesRecipient(payload.branch)
  if (!to) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    )
  }

  const { email, firstName, lastName, signature, slug } = payload
  const name = [firstName, lastName].filter(Boolean).join(" ")
  const agreement = await loadAgreement(
    branch.id,
    typeof slug === "string" ? slug : ""
  )

  const attachments = signature
    ? [
        {
          filename: "signature.png",
          contentId: SIGNATURE_CID,
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
    html: renderManagerEmail(payload, branch, agreement),
    attachments,
  })

  if (!result.ok) {
    const status = result.reason === "not_configured" ? 500 : 502
    return NextResponse.json({ error: "Failed to send email." }, { status })
  }

  if (email?.trim()) {
    const invitation = await birthdayInvitationAttachment(payload, branch)
    await sendMail({
      to: email.trim(),
      subject: `קיבלנו את בקשת האירוע שלך · ${BRAND_HE}`,
      html: renderCustomerEmail(
        payload,
        branch,
        name || email.trim(),
        Boolean(invitation)
      ),
      attachments: invitation && [invitation],
    })
  }

  return NextResponse.json({ ok: true })
}
