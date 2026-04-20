"use client"

import * as React from "react"
import { IconAlertTriangle, IconMail } from "@tabler/icons-react"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const fieldClass =
  "block w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink placeholder:text-ink-muted shadow-soft outline-none transition focus:border-ink/30 focus:ring-2 focus:ring-ink/10 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15"

const ctaClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-medium text-surface shadow-soft transition hover:scale-[1.01] hover:shadow-card disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-soft"

type Step = "email" | "otp"

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("email")
  const [email, setEmail] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [pending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    startTransition(async () => {
      const { error: err } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      })
      if (err) {
        setError(err.message ?? "שליחת הקוד נכשלה")
        return
      }
      setStep("otp")
      setInfo("קוד נשלח לכתובת שהזנת. בדוק/י את תיבת הדואר.")
    })
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    startTransition(async () => {
      const { error: err } = await authClient.signIn.emailOtp({ email, otp })
      if (err) {
        setError(err.message ?? "קוד שגוי או פג תוקף")
        return
      }
      router.push("/admin")
      router.refresh()
    })
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            כתובת אימייל
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={pending}
            />
          </label>
          <button
            type="submit"
            className={ctaClass}
            disabled={pending || !email}
          >
            <IconMail className="size-5" aria-hidden />
            שלח/י לי קוד
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            קוד בן 6 ספרות
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              className={cn(
                fieldClass,
                "text-center text-2xl tracking-[0.5em]"
              )}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="------"
              disabled={pending}
            />
          </label>
          <button
            type="submit"
            className={ctaClass}
            disabled={pending || otp.length !== 6}
          >
            אישור והתחברות
          </button>
          <button
            type="button"
            className="self-center text-sm text-ink-muted underline-offset-4 hover:underline"
            onClick={() => {
              setStep("email")
              setOtp("")
              setInfo(null)
              setError(null)
            }}
            disabled={pending}
          >
            שינוי כתובת אימייל
          </button>
        </form>
      )}

      {info ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink">
          {info}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <IconAlertTriangle className="mt-0.5 size-4" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}
