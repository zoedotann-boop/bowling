import "server-only"

import { isIP } from "node:net"

import { eq } from "drizzle-orm"
import { Resend } from "resend"

import { DEFAULT_BRANCH, isBranchId, type Branch } from "@/lib/branches"
import { db } from "@/lib/db"
import { getSiteBranches } from "@/lib/db/queries/site"
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

export async function resolveInquiriesRecipient(
  slug: unknown
): Promise<string | undefined> {
  if (isBranchId(slug)) {
    const loc = await db.query.location.findFirst({
      where: eq(location.slug, slug),
      columns: { inquiriesEmail: true },
    })
    const configured = loc?.inquiriesEmail?.trim()
    if (configured) return configured
  }

  return process.env.EVENTS_TO_EMAIL?.trim() || undefined
}

export async function resolveBranch(slug: unknown): Promise<Branch> {
  const branches = await getSiteBranches()
  return branches[isBranchId(slug) ? slug : DEFAULT_BRANCH]
}

const FALLBACK_SENDER_HOST = "bowlingil.com"

export function loginSender(baseUrl: string | undefined): string {
  const host = URL.parse(baseUrl ?? "")?.hostname.replace(/^www\./, "")
  const isPublic = host?.includes(".") && !isIP(host)
  return `login@${isPublic ? host : FALLBACK_SENDER_HOST}`
}

export interface MailAttachment {
  filename: string
  content: Buffer
  contentId?: string
}

export interface SendMailInput {
  from?: string
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
  const from = input.from || process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return { ok: false, reason: "not_configured" }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ ...input, from })
  return error ? { ok: false, reason: "send_failed" } : { ok: true }
}
