import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/schema"

// Email + password authentication with signup disabled: admins are provisioned
// by an owner (there is no public registration). The `role` column is exposed
// as a read-only additional field so it rides along on the session user.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "staff",
      },
    },
  },
  // Must be the last plugin so it can set cookies from Server Actions.
  plugins: [nextCookies()],
})
