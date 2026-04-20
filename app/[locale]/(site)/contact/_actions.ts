"use server"

import { z } from "zod"
import { Resend } from "resend"
import { branches, getBranchBySlug } from "@/lib/branches"

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  email: z.string().email().max(160).optional().or(z.literal("")),
  branch: z.enum(branches.map((b) => b.slug) as [string, ...string[]]),
  eventType: z.string().max(40).optional(),
  preferredDate: z.string().max(40).optional(),
  guests: z.string().max(20).optional(),
  message: z.string().min(2).max(2000),
})

export type ContactFormState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Partial<Record<keyof z.infer<typeof ContactSchema>, string>>
}

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries())
  const parsed = ContactSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof ContactSchema>
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: "error", fieldErrors }
  }

  const data = parsed.data
  const branch = getBranchBySlug(data.branch)
  if (!branch) {
    return { status: "error", message: "Unknown branch" }
  }

  const subject = `New inquiry · ${branch.slug}${data.eventType ? ` · ${data.eventType}` : ""}`
  const body = [
    `Branch: ${branch.slug}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : null,
    data.eventType ? `Event type: ${data.eventType}` : null,
    data.preferredDate ? `Preferred date: ${data.preferredDate}` : null,
    data.guests ? `Guests: ${data.guests}` : null,
    "",
    "Message:",
    data.message,
  ]
    .filter(Boolean)
    .join("\n")

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL ?? "no-reply@bowling.local"

  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY missing - logging only:", {
      subject,
      body,
    })
    return { status: "success" }
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from,
      to: branch.email,
      replyTo: data.email || undefined,
      subject,
      text: body,
    })
    return { status: "success" }
  } catch (err) {
    console.error("[contact] resend failed", err)
    return { status: "error", message: "send_failed" }
  }
}
