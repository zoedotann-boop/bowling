"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { AdminField, AdminInput } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { ADMIN_ROOT } from "@/lib/admin/routes"
import { authClient } from "@/lib/auth-client"

export function LoginForm() {
  const t = useTranslations("admin.signIn")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    })
    setPending(false)
    if (sendError) {
      setError(t("sendError"))
      return
    }
    setSent(true)
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email,
      otp: code,
    })
    if (verifyError) {
      setError(t("error"))
      setPending(false)
      return
    }
    router.push(ADMIN_ROOT)
    router.refresh()
  }

  return (
    <form
      onSubmit={sent ? verifyCode : requestCode}
      className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h1 className="text-lg font-semibold">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">
        {sent ? t("codeSent", { email }) : t("subtitle")}
      </p>
      {sent ? (
        <AdminField label={t("code")} htmlFor="code">
          <AdminInput
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </AdminField>
      ) : (
        <AdminField label={t("email")} htmlFor="email">
          <AdminInput
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </AdminField>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? sent
            ? t("pending")
            : t("sending")
          : sent
            ? t("submit")
            : t("sendCode")}
      </Button>
      {sent && (
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setCode("")
            setError(null)
          }}
          className="block w-full text-center text-sm text-muted-foreground underline"
        >
          {t("changeEmail")}
        </button>
      )}
    </form>
  )
}
