import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"

import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/schema"
import { sendLoginOtp } from "@/lib/auth-email"

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
