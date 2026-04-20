"use client"

import * as React from "react"
import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  function handleClick() {
    startTransition(async () => {
      await authClient.signOut()
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <IconLogout className="size-4" aria-hidden />
      התנתקות
    </button>
  )
}
