import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "התחברות ניהול",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold text-ink">התחברות ניהול</h1>
        <p className="text-sm text-ink-muted">
          לגישה לאזור הניהול בלבד. אין כאן הרשמה.
        </p>
      </header>
      <LoginForm />
    </div>
  )
}
