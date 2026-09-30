import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import { and, eq } from "drizzle-orm"

import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_LINK_TTL_HOURS,
} from "@/lib/admin/password"
import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/schema"
import { sendLoginOtp, sendPasswordEmail } from "@/lib/auth-email"

async function hasPassword(userId: string): Promise<boolean> {
  const credential = await db.query.account.findFirst({
    columns: { id: true },
    where: and(
      eq(account.userId, userId),
      eq(account.providerId, "credential")
    ),
  })
  return Boolean(credential)
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "staff",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    resetPasswordTokenExpiresIn: PASSWORD_LINK_TTL_HOURS * 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      const kind = (await hasPassword(user.id)) ? "reset" : "invite"
      await sendPasswordEmail(user.email, kind, url)
    },
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      async sendVerificationOTP({ email, otp }) {
        await sendLoginOtp(email, otp)
      },
    }),
    nextCookies(),
  ],
})
