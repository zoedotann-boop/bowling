import { getLocale, getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { Branch } from "@/lib/branches"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function FloatingWhatsApp({ branch }: { branch: Branch }) {
  const t = await getTranslations("WhatsApp")
  const locale = (await getLocale()) as keyof Branch["displayName"]
  const message = t("prefilled", { branch: branch.displayName[locale] })
  const href = buildWhatsAppLink(branch, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={t("label")}
      className="fixed end-6 bottom-6 z-50 hidden size-14 place-items-center rounded-full bg-whatsapp text-white shadow-card transition hover:scale-105 hover:bg-whatsapp-hover hover:shadow-hover md:grid"
    >
      <IconBrandWhatsapp className="size-7" aria-hidden />
      <span className="sr-only">{t("label")}</span>
    </a>
  )
}
