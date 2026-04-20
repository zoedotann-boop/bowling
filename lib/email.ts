import { render } from "@react-email/render"
import { Resend } from "resend"
import OtpEmail from "@/emails/otp-email"

let client: Resend | null = null

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!client) client = new Resend(apiKey)
  return client
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const from = process.env.CONTACT_FROM_EMAIL ?? "no-reply@bowling.local"
  const subject = `קוד התחברות לניהול · ${otp}`
  const template = OtpEmail({ otp })
  const [html, text] = await Promise.all([
    render(template),
    render(template, { plainText: true }),
  ])

  const resend = getClient()
  if (!resend) {
    console.info(
      "[auth] RESEND_API_KEY missing - OTP not sent. Code:",
      otp,
      "→",
      to
    )
    return
  }

  try {
    await resend.emails.send({ from, to, subject, text, html })
  } catch (err) {
    console.error("[auth] failed to send OTP email", err)
    throw err
  }
}
