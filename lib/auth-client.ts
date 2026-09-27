import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

// Client-side auth helpers for the passwordless admin login: request a one-time
// code (`emailOtp.sendVerificationOtp`) then verify it (`signIn.emailOtp`).
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
})
