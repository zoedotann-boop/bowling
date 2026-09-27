import "server-only"

import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { Resend } from "resend"

import {
  BRANCH_COOKIE,
  BRANCHES,
  DEFAULT_BRANCH,
  isBranchId,
  type Branch,
} from "@/lib/branches"
import { db } from "@/lib/db"
import { location } from "@/lib/db/schema"

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

export async function resolveActiveBranch(): Promise<Branch> {
  const cookieStore = await cookies()
  const slug = cookieStore.get(BRANCH_COOKIE)?.value
  return BRANCHES[isBranchId(slug) ? slug : DEFAULT_BRANCH]
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

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return { ok: false, reason: "not_configured" }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from, ...input })
  return error ? { ok: false, reason: "send_failed" } : { ok: true }
}
