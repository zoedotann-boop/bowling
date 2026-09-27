import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"

import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/schema"
import { sendLoginOtp } from "@/lib/auth-email"

// Passwordless admin auth: sign-in is a one-time code emailed via the emailOTP
// plugin, with public sign-up disabled so a code is only ever sent to an admin
// that an owner has already provisioned. The `role` column is exposed as a
// read-only additional field so it rides along on the session user.
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
    // Must be the last plugin so it can set cookies from Server Actions.
    nextCookies(),
  ],
})
