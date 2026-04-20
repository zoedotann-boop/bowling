import { getLocale, getTranslations } from "next-intl/server"
import { IconBrandWhatsapp, IconPhone } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function MobileActionBar({ branch }: { branch: Branch }) {
  const t = await getTranslations()
  const wa = await getTranslations("WhatsApp")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const message = wa("prefilled", { branch: branch.displayName[locale] })
  const href = buildWhatsAppLink(branch, message)
  const tel = branch.phone.replace(/[^\d+]/g, "")

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/85 px-4 pt-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="flex items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp text-sm font-medium text-white shadow-soft transition active:scale-[0.98]"
        >
          <IconBrandWhatsapp className="size-5" aria-hidden />
          {t("Cta.whatsapp")}
        </a>
        <a
          href={`tel:${tel}`}
          aria-label={t("Cta.callNow")}
          className="grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink shadow-soft transition active:scale-[0.98]"
        >
          <IconPhone className="size-5" aria-hidden />
        </a>
      </div>
    </div>
  )
}
