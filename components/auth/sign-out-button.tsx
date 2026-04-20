"use client"

import * as React from "react"
import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

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
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      <IconLogout className="size-4" aria-hidden />
      התנתקות
    </Button>
  )
}
