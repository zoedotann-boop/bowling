"use client"

import * as React from "react"
import { IconAlertTriangle, IconMail } from "@tabler/icons-react"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { Eyebrow } from "@/components/common/eyebrow"
import { RetroButton } from "@/components/brand/retro-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
      <header className="flex flex-col items-center gap-2 text-center">
        <Eyebrow tone="red">Admin</Eyebrow>
        <h1 className="font-display text-2xl leading-tight text-ink sm:text-3xl">
          התחברות ניהול
        </h1>
        <p className="text-sm text-ink-soft">
          לגישה לאזור הניהול בלבד. אין כאן הרשמה.
        </p>
      </header>

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-ink uppercase">
            כתובת אימייל
            <Input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={pending}
              className="h-12 text-base"
            />
          </label>
          <RetroButton
            tone="red"
            size="lg"
            full
            disabled={pending || !email}
            nativeButton
            render={
              <button type="submit">
                <IconMail aria-hidden />
                שלח/י לי קוד
              </button>
            }
          />
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 font-mono text-[11px] font-bold tracking-[0.14em] text-ink uppercase">
            קוד בן 6 ספרות
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="------"
              disabled={pending}
              className={cn("h-14 text-center text-2xl tracking-[0.5em]")}
            />
          </label>
          <RetroButton
            tone="red"
            size="lg"
            full
            disabled={pending || otp.length !== 6}
            nativeButton
            render={<button type="submit">אישור והתחברות</button>}
          />
          <button
            type="button"
            className="self-center font-mono text-xs tracking-[0.12em] text-ink-soft uppercase underline-offset-4 hover:underline"
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
        <p className="border-2 border-ink bg-yellow px-4 py-3 text-sm font-medium text-ink shadow-block-sm">
          {info}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 border-2 border-red-2 bg-red-2/10 px-4 py-3 text-sm font-medium text-red-2 shadow-block-sm"
        >
          <IconAlertTriangle className="mt-0.5 size-4" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}
