import { spyOn } from "bun:test"
import { randomUUID } from "node:crypto"

import * as authEmail from "@/lib/auth-email"
import type { PasswordEmailKind } from "@/lib/auth-email"
import { user } from "@/lib/db/schema"

import { db } from "./admin-actions"

interface PasswordMail {
  to: string
  kind: PasswordEmailKind
  url: string
}

export const outbox = {
  codes: [] as { to: string; otp: string }[],
  passwordLinks: [] as PasswordMail[],
  clear() {
    this.codes.length = 0
    this.passwordLinks.length = 0
  },
}

spyOn(authEmail, "sendLoginOtp").mockImplementation(async (to, otp) => {
  outbox.codes.push({ to, otp })
})
spyOn(authEmail, "sendPasswordEmail").mockImplementation(
  async (to, kind, url) => {
    outbox.passwordLinks.push({ to, kind, url })
  }
)

process.env.BETTER_AUTH_SECRET ??= "test-secret-that-is-at-least-32-chars"
process.env.BETTER_AUTH_URL ??= "http://localhost:3000"

export const { auth } = await import("@/lib/auth")

export function linkToken(url: string): string {
  const token = new URL(url).pathname.split("/").at(-1)
  if (!token) throw new Error(`No token in ${url}`)
  return token
}

export async function addUser(email: string) {
  await db.insert(user).values({
    id: randomUUID(),
    name: email,
    email,
    emailVerified: true,
    role: "owner",
  })
}

export { db }
