import { getTranslations } from "next-intl/server"
import { IconBrandWhatsapp } from "@tabler/icons-react"
import type { SiteBranch } from "@/lib/site-branch"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export async function FloatingWhatsApp({ branch }: { branch: SiteBranch }) {
  const t = await getTranslations("WhatsApp")
  const message = t("prefilled", { branch: branch.displayName })
  const href = buildWhatsAppLink(branch, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={t("label")}
      className="fixed end-6 bottom-6 z-50 hidden size-14 place-items-center rounded-full border-2 border-ink bg-whatsapp text-white shadow-block transition hover:bg-whatsapp-hover active:translate-x-[1px] active:translate-y-[1px] md:grid"
    >
      <IconBrandWhatsapp className="size-7" aria-hidden />
      <span className="sr-only">{t("label")}</span>
    </a>
  )
}
