import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { Container } from "@/components/home/container"

export function AccessibilityPage() {
  const t = useTranslations("accessibilityPage")
  const sections = t.raw("sections") as { title: string; items: string[] }[]

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-orange lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] text-navy lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-2 font-mono text-[12.5px] font-bold text-faint lg:text-[13px]">
          {t("updated")}
        </p>
      </div>

      <p className="max-w-3xl text-[15px] leading-[1.7] font-semibold text-mud lg:text-[17px]">
        {t("intro")}
      </p>

      <div className="mt-8 grid gap-4 lg:mt-12 lg:grid-cols-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-[24px] border-[4px] border-dotted border-navy p-6 lg:p-8"
          >
            <h2 className="font-heading text-[22px] font-black tracking-[-0.5px] text-navy lg:text-[26px]">
              {section.title}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full border-[3px] border-navy bg-mint">
                    <Check className="size-3 text-navy" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] font-semibold text-navy">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border-[5px] border-navy bg-teal p-7 lg:mt-12 lg:p-11">
        <h2 className="font-heading text-[24px] font-black tracking-[-0.5px] text-cream-warm lg:text-[32px]">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.6] font-semibold text-cream-warm/90 lg:text-[17px]">
          {t("contactText")}
        </p>
        <div className="mt-4 flex flex-col gap-1.5 font-heading text-[15px] font-extrabold text-marigold lg:text-base">
          <span>{t("contactPhone")}</span>
          <span>{t("contactEmail")}</span>
        </div>
      </div>
    </Container>
  )
}
