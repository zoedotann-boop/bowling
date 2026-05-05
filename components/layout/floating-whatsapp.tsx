import { getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { getTodayHours, isOpenNow } from "@/lib/hours"

export async function FloatingWhatsApp({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("WhatsApp")
  const tStatus = await getTranslations("Status")
  const message = t("prefilled", { branch: branch.displayName })
  const href = buildWhatsAppLink(branch, message)
  const today = getTodayHours(branch)
  const open = isOpenNow(today)
  const statusLabel = open
    ? tStatus("openUntil", { time: today.close })
    : !today.isClosed && today.open
      ? tStatus("opensAt", { time: today.open })
      : tStatus("closed")

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-6">
      <div
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink shadow-block-sm"
        role="status"
      >
        <span className="relative inline-grid place-items-center">
          <span
            aria-hidden
            className={`absolute size-2.5 rounded-full ${
              open ? "animate-pulse bg-ink/30" : "bg-transparent"
            }`}
          />
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${open ? "bg-ink" : "bg-ink/40"}`}
          />
        </span>
        <span>{statusLabel}</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        aria-label={t("label")}
        className="pointer-events-auto grid size-12 place-items-center rounded-full border-2 border-ink bg-whatsapp text-white shadow-block transition hover:bg-whatsapp-hover active:translate-x-[1px] active:translate-y-[1px] sm:size-14"
      >
        <IconBrandWhatsapp className="size-6 sm:size-7" aria-hidden />
        <span className="sr-only">{t("label")}</span>
      </a>
    </div>
  )
}
