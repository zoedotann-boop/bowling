import "server-only"

import { PASSWORD_LINK_TTL_HOURS } from "@/lib/admin/password"
import { BRANCHES, DEFAULT_BRANCH } from "@/lib/branches"
import { loginSender, sendMail } from "@/lib/email"
import {
  actionButton,
  emailShell,
  linkFallback,
  noteParagraph,
  otpCode,
} from "@/lib/email-template"

async function sendAuthMail(to: string, subject: string, html: string) {
  const result = await sendMail({
    from: loginSender(process.env.BETTER_AUTH_URL),
    to,
    subject,
    html,
  })
  if (!result.ok) {
    throw new Error(`Failed to send "${subject}" email: ${result.reason}`)
  }
}

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
    contactLinks: false,
  })

  await sendAuthMail(to, "קוד הכניסה שלך לאזור הניהול 🔐", html)
}

const PASSWORD_EMAILS = {
  invite: {
    subject: "הוזמנתם לאזור הניהול של האתר 🎳",
    preheader: "בחרו סיסמה כדי להיכנס לאזור הניהול",
    heading: "ברוכים הבאים לאזור הניהול",
    intro:
      "יש לכם גישה לאזור הניהול של האתר. לחצו על הכפתור כדי לבחור סיסמה ולהיכנס.",
    button: "בחירת סיסמה",
    note: "אפשר גם תמיד להיכנס בלי סיסמה, עם קוד חד-פעמי שנשלח לאימייל הזה.",
  },
  reset: {
    subject: "איפוס הסיסמה לאזור הניהול 🔐",
    preheader: "קישור לבחירת סיסמה חדשה",
    heading: "איפוס סיסמה",
    intro:
      "קיבלנו בקשה לאיפוס הסיסמה שלכם לאזור הניהול. לחצו על הכפתור כדי לבחור סיסמה חדשה.",
    button: "בחירת סיסמה חדשה",
    note: "אם לא ביקשתם לאפס את הסיסמה, אפשר להתעלם מההודעה — הסיסמה הנוכחית לא תשתנה.",
  },
} as const

export type PasswordEmailKind = keyof typeof PASSWORD_EMAILS

export function passwordEmail(kind: PasswordEmailKind, url: string) {
  const copy = PASSWORD_EMAILS[kind]
  const html = emailShell({
    branch: BRANCHES[DEFAULT_BRANCH],
    preheader: copy.preheader,
    heading: copy.heading,
    intro: copy.intro,
    body:
      actionButton(url, copy.button) +
      noteParagraph(
        `הקישור תקף ל-${PASSWORD_LINK_TTL_HOURS} שעות ולשימוש אחד. ${copy.note}`
      ) +
      linkFallback("הכפתור לא עובד? העתיקו את הקישור לדפדפן:", url),
    contactLinks: false,
  })
  return { subject: copy.subject, html }
}

export async function sendPasswordEmail(
  to: string,
  kind: PasswordEmailKind,
  url: string
): Promise<void> {
  const { subject, html } = passwordEmail(kind, url)
  await sendAuthMail(to, subject, html)
}
