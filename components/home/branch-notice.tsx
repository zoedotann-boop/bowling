"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { CalendarClock, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { useBranch } from "@/components/branch-context"

const DISMISS_KEY = "branch-notice-dismissed"
// sessionStorage isn't reactive, so there's nothing to subscribe to.
const noSubscribe = () => () => {}

export function BranchNotice() {
  const t = useTranslations("notice")
  const { branch } = useBranch()
  const [closed, setClosed] = useState(false)

  // Read the session dismissal without an effect. On the server we treat it as
  // dismissed so nothing renders (avoids any hydration mismatch), then the real
  // value is read on the client after hydration.
  const dismissed = useSyncExternalStore(
    noSubscribe,
    () => sessionStorage.getItem(DISMISS_KEY) === branch.id,
    () => true
  )

  // Show once per session, only for branches that have a notice.
  const open = branch.hasNotice && !dismissed && !closed

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const close = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, branch.id)
    } catch {
      // Ignore storage failures (e.g. private mode).
    }
    setClosed(true)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex animate-page-in items-center justify-center p-4"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label={t("close")}
        onClick={close}
        className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border-2 border-navy bg-card glow-primary">
        <div className="h-2.5 border-b border-navy bg-red" />

        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="absolute end-4 top-5 flex size-9 items-center justify-center rounded-full border border-navy bg-card text-navy transition-colors hover:bg-red hover:text-foreground"
        >
          <X className="size-4" strokeWidth={3} />
        </button>

        <div className="px-7 pt-7 pb-8 text-center lg:px-9 lg:pb-9">
          <span className="inline-block rounded-sm border border-primary bg-card px-3.5 py-1 font-mono text-[12px] font-bold text-primary glow-primary">
            {t("eyebrow")}
          </span>

          <div className="mx-auto mt-5 flex size-14 items-center justify-center rounded-sm border border-navy bg-card">
            <CalendarClock className="size-7 text-rust" strokeWidth={2.25} />
          </div>

          <div className="mt-4 font-heading text-[15px] font-extrabold text-rust">
            {t("date")}
          </div>
          <h2 className="mt-1.5 font-heading text-[23px] leading-tight font-black tracking-[-0.5px] text-navy lg:text-[26px]">
            {t("title")}
          </h2>
          <p className="mt-3 text-[15px] font-semibold text-mud">{t("body")}</p>
          <p className="mt-4 font-heading text-[19px] font-black text-secondary">
            {t("footer")}
          </p>

          <button
            type="button"
            onClick={close}
            className="mt-6 w-full rounded-sm border border-primary bg-primary px-6 py-3.5 font-heading text-[15px] font-extrabold text-primary-foreground glow-primary transition-colors hover:bg-secondary hover:border-secondary hover:text-secondary-foreground"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  )
}
