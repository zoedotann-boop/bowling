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
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(false)
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    })
    if (signInError) {
      setError(true)
      setPending(false)
      return
    }
    router.push(ADMIN_ROOT)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h1 className="text-lg font-semibold">{t("title")}</h1>
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
      <AdminField label={t("password")} htmlFor="password">
        <AdminInput
          id="password"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </AdminField>
      {error && <p className="text-sm text-destructive">{t("error")}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("pending") : t("submit")}
      </Button>
    </form>
  )
}
