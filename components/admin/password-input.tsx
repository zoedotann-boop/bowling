"use client"

import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { AdminInput } from "@/components/admin/admin-ui"

export function PasswordInput(
  props: Omit<React.ComponentProps<"input">, "type" | "dir">
) {
  const t = useTranslations("admin.signIn")
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <AdminInput
        {...props}
        type={visible ? "text" : "password"}
        dir="ltr"
        className="pr-10"
      />
      <button
        type="button"
        aria-label={t("showPassword")}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Icon aria-hidden className="size-4" />
      </button>
    </div>
  )
}
