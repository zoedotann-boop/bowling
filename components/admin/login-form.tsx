"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { AdminTabs } from "@/components/admin/admin-tabs"
import { AdminField, AdminInput } from "@/components/admin/admin-ui"
import { PasswordInput } from "@/components/admin/password-input"
import { Button } from "@/components/ui/button"
import { PASSWORD_LINK_TTL_HOURS } from "@/lib/admin/password"
import { ADMIN_ROOT, setPasswordPath } from "@/lib/admin/routes"
import { authClient } from "@/lib/auth-client"

interface EmailProps {
  email: string
  onEmailChange: (email: string) => void
}

export function LoginForm() {
  const t = useTranslations("admin.signIn")
  const [email, setEmail] = useState("")
  const emailProps = { email, onEmailChange: setEmail }

  return (
    <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>
      <AdminTabs
        stretch
        tabs={[
          {
            value: "password",
            label: t("passwordTab"),
            content: <PasswordSignIn {...emailProps} />,
          },
          {
            value: "code",
            label: t("codeTab"),
            content: <CodeSignIn {...emailProps} />,
          },
        ]}
      />
    </div>
  )
}

function useEnterAdmin() {
  const router = useRouter()
  return () => {
    router.push(ADMIN_ROOT)
    router.refresh()
  }
}

function EmailField({ email, onEmailChange }: EmailProps) {
  const t = useTranslations("admin.signIn")
  return (
    <AdminField label={t("email")} htmlFor="email">
      <AdminInput
        id="email"
        type="email"
        dir="ltr"
        autoComplete="username"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        required
      />
    </AdminField>
  )
}

function FormError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )
}

function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-center text-sm text-muted-foreground underline hover:text-foreground"
    >
      {children}
    </button>
  )
}

function PasswordSignIn(props: EmailProps) {
  const t = useTranslations("admin.signIn")
  const enterAdmin = useEnterAdmin()
  const [password, setPassword] = useState("")
  const [forgot, setForgot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (forgot) {
    return <ForgotPassword {...props} onBack={() => setForgot(false)} />
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: signInError } = await authClient.signIn.email({
        email: props.email,
        password,
      })
      if (signInError) setError(t("passwordError"))
      else enterAdmin()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <EmailField {...props} />
      <AdminField label={t("password")} htmlFor="password">
        <PasswordInput
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AdminField>
      <FormError error={error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("pending") : t("submit")}
      </Button>
      <LinkButton onClick={() => setForgot(true)}>
        {t("forgotPassword")}
      </LinkButton>
    </form>
  )
}

function ForgotPassword({
  onBack,
  ...props
}: EmailProps & { onBack: () => void }) {
  const t = useTranslations("admin.signIn")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: sendError } = await authClient.requestPasswordReset({
        email: props.email,
        redirectTo: setPasswordPath(props.email),
      })
      if (sendError) setError(t("linkError"))
      else setSent(true)
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {sent
          ? t("linkSent", {
              email: props.email,
              hours: PASSWORD_LINK_TTL_HOURS,
            })
          : t("forgotIntro")}
      </p>
      {!sent && (
        <>
          <EmailField {...props} />
          <FormError error={error} />
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("sending") : t("sendLink")}
          </Button>
        </>
      )}
      <LinkButton onClick={onBack}>{t("backToSignIn")}</LinkButton>
    </form>
  )
}

function CodeSignIn(props: EmailProps) {
  const t = useTranslations("admin.signIn")
  const enterAdmin = useEnterAdmin()
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: sendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: props.email,
          type: "sign-in",
        })
      if (sendError) setError(t("sendError"))
      else setSent(true)
    })
  }

  function verifyCode(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: verifyError } = await authClient.signIn.emailOtp({
        email: props.email,
        otp: code,
      })
      if (verifyError) setError(t("codeError"))
      else enterAdmin()
    })
  }

  return (
    <form onSubmit={sent ? verifyCode : requestCode} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {sent ? t("codeSent", { email: props.email }) : t("codeIntro")}
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
        <EmailField {...props} />
      )}
      <FormError error={error} />
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
        <LinkButton
          onClick={() => {
            setSent(false)
            setCode("")
            setError(null)
          }}
        >
          {t("changeEmail")}
        </LinkButton>
      )}
    </form>
  )
}
