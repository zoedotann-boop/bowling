"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { AdminField, AdminInput } from "@/components/admin/admin-ui"
import { PasswordInput } from "@/components/admin/password-input"
import { Button } from "@/components/ui/button"
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_LINK_TTL_HOURS,
} from "@/lib/admin/password"
import {
  ADMIN_LOGIN_PATH,
  ADMIN_ROOT,
  setPasswordPath,
} from "@/lib/admin/routes"
import { authClient } from "@/lib/auth-client"

const cardClass =
  "w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"

export function SetPasswordForm({
  token,
  email,
}: {
  token: string | null
  email: string | null
}) {
  const t = useTranslations("admin.setPassword")
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [expired, setExpired] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!token || expired) return <ExpiredLink email={email} />

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (resetError) {
        if (resetError.code === "INVALID_TOKEN") setExpired(true)
        else setError(t("error", { min: MIN_PASSWORD_LENGTH }))
        return
      }
      const signedIn =
        email && !(await authClient.signIn.email({ email, password })).error
      router.push(signedIn ? ADMIN_ROOT : ADMIN_LOGIN_PATH)
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className={cardClass}>
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </header>
      {email && (
        <AdminField label={t("email")} htmlFor="email">
          <AdminInput
            id="email"
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            readOnly
          />
        </AdminField>
      )}
      <AdminField label={t("password")} htmlFor="new-password">
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={128}
          autoFocus
          aria-describedby="new-password-hint"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AdminField>
      <p id="new-password-hint" className="text-xs text-muted-foreground">
        {t("hint", { min: MIN_PASSWORD_LENGTH })}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("pending") : t("submit")}
      </Button>
    </form>
  )
}

function ExpiredLink({ email }: { email: string | null }) {
  const t = useTranslations("admin.setPassword")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function resend() {
    if (!email) return
    setError(null)
    startTransition(async () => {
      const { error: sendError } = await authClient.requestPasswordReset({
        email,
        redirectTo: setPasswordPath(email),
      })
      if (sendError) setError(t("resendError"))
      else setSent(true)
    })
  }

  return (
    <div className={cardClass}>
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">{t("expiredTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {sent
            ? t("resent", { email: email ?? "" })
            : t("expiredBody", { hours: PASSWORD_LINK_TTL_HOURS })}
        </p>
      </header>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {email && !sent && (
        <Button
          type="button"
          disabled={pending}
          onClick={resend}
          className="w-full"
        >
          {pending ? t("resending") : t("resend")}
        </Button>
      )}
      <Link
        href={ADMIN_LOGIN_PATH}
        className="block text-center text-sm text-muted-foreground underline hover:text-foreground"
      >
        {t("toLogin")}
      </Link>
    </div>
  )
}
