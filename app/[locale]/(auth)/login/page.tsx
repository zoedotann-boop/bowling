import type { Metadata } from "next"
import { BowlingLogo } from "@/components/brand/bowling-logo"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "התחברות ניהול",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col items-center gap-5 text-center">
        <BowlingLogo city="Admin" size="sm" />
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl text-ink sm:text-3xl">
            התחברות ניהול
          </h1>
          <p className="text-sm text-ink-soft">
            לגישה לאזור הניהול בלבד. אין כאן הרשמה.
          </p>
        </div>
      </header>
      <LoginForm />
    </div>
  )
}
