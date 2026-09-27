import "server-only"

import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { Resend } from "resend"

import { BRANCH_COOKIE } from "@/lib/branches"
import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

// Escapes user-supplied text before it is interpolated into an HTML email body.
export const escapeHtml = (value: string) =>
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

// Resolves where inquiry emails for the active branch should be delivered.
// Priority: the branch's admin-configured inbox → the EVENTS_TO_EMAIL fallback.
// The active branch comes from the same cookie the public site uses.
export async function resolveInquiriesRecipient(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const slug = cookieStore.get(BRANCH_COOKIE)?.value

  if (slug) {
    const loc = await db.query.location.findFirst({
      where: eq(location.slug, slug),
      columns: { inquiriesEmail: true },
    })
    const configured = loc?.inquiriesEmail?.trim()
    if (configured) return configured
  }

  return process.env.EVENTS_TO_EMAIL?.trim() || undefined
}

interface MailAttachment {
  filename: string
  content: Buffer
}

export interface SendMailInput {
  to: string
  subject: string
  html: string
  replyTo?: string
  attachments?: MailAttachment[]
}

export type SendMailResult =
  { ok: true } | { ok: false; reason: "not_configured" | "send_failed" }

// Sends a transactional email through Resend. The sender/API key come from the
// environment; a missing key or sender is reported as "not_configured" so the
// caller can return a 500 without throwing.
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return { ok: false, reason: "not_configured" }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from, ...input })
  return error ? { ok: false, reason: "send_failed" } : { ok: true }
}
