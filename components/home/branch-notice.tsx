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
      className="animate-page-in fixed inset-0 z-[90] flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label={t("close")}
        onClick={close}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border-[5px] border-navy bg-cream-warm shadow-2xl">
        <div className="h-2.5 border-b-[4px] border-navy bg-red" />

        <button
          type="button"
          onClick={close}
          aria-label={t("close")}
          className="absolute end-4 top-5 flex size-9 items-center justify-center rounded-full border-[3px] border-navy bg-paper text-navy transition-colors hover:bg-red hover:text-paper"
        >
          <X className="size-4" strokeWidth={3} />
        </button>

        <div className="px-7 pt-7 pb-8 text-center lg:px-9 lg:pb-9">
          <span className="inline-block rounded-full border-[3px] border-navy bg-marigold px-3.5 py-1 font-mono text-[12px] font-bold text-navy">
            {t("eyebrow")}
          </span>

          <div className="mx-auto mt-5 flex size-14 items-center justify-center rounded-2xl border-[4px] border-dotted border-navy bg-paper">
            <CalendarClock className="size-7 text-rust" strokeWidth={2.25} />
          </div>

          <div className="mt-4 font-heading text-[15px] font-extrabold text-rust">
            {t("date")}
          </div>
          <h2 className="mt-1.5 font-heading text-[23px] leading-tight font-black tracking-[-0.5px] text-navy lg:text-[26px]">
            {t("title")}
          </h2>
          <p className="mt-3 text-[15px] font-semibold text-mud">{t("body")}</p>
          <p className="mt-4 font-heading text-[19px] font-black text-teal">
            {t("footer")}
          </p>

          <button
            type="button"
            onClick={close}
            className="mt-6 w-full rounded-full border-[3px] border-navy bg-navy px-6 py-3.5 font-heading text-[15px] font-extrabold text-paper transition-colors hover:bg-rust"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  )
}
