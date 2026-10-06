"use client"

import { Check, Copy, ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { AdminInput } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"

const subscribe = () => () => {}

function useOrigin() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ""
  )
}

export function WaiverLink({ path }: { path: string }) {
  const t = useTranslations("admin.events")
  const url = `${useOrigin()}${path}`
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      inputRef.current?.select()
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <AdminInput
        ref={inputRef}
        readOnly
        dir="ltr"
        value={url}
        aria-label={t("waiverLink")}
        onFocus={(event) => event.currentTarget.select()}
        className="sm:flex-1"
      />
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          <span aria-live="polite">
            {copied ? t("waiverCopied") : t("waiverCopy")}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a href={path} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              {t("waiverVisit")}
            </a>
          }
        />
      </div>
    </div>
  )
}
