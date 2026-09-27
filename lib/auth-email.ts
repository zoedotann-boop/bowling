import "server-only"

import { BRANCHES, DEFAULT_BRANCH } from "@/lib/branches"
import { sendMail } from "@/lib/email"
import { emailShell, noteParagraph, otpCode } from "@/lib/email-template"

export async function sendLoginOtp(to: string, otp: string): Promise<void> {
  const html = emailShell({
    branch: BRANCHES[DEFAULT_BRANCH],
    preheader: "קוד חד-פעמי לכניסה לאזור הניהול",
    heading: "קוד הכניסה שלך",
    intro: "הזינו את הקוד הבא כדי להיכנס לאזור הניהול:",
    body:
      otpCode(otp) +
      noteParagraph(
        "הקוד תקף ל-5 דקות. אם לא ביקשתם אותו, אפשר להתעלם מההודעה."
      ),
  })

  const result = await sendMail({
    to,
    subject: "קוד הכניסה שלך לאזור הניהול 🔐",
    html,
  })
  if (!result.ok) {
    throw new Error(`Failed to send login OTP email: ${result.reason}`)
  }
}
