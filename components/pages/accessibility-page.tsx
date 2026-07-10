import { Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { Container } from "@/components/home/container"

export function AccessibilityPage() {
  const t = useTranslations("accessibilityPage")
  const sections = t.raw("sections") as { title: string; items: string[] }[]

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
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
            className="rounded-sm border border-border bg-card p-6 transition-colors hover:border-primary lg:p-8"
          >
            <h2 className="font-heading text-[22px] font-black tracking-[-0.5px] text-navy lg:text-[26px]">
              {section.title}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full border border-secondary bg-secondary">
                    <Check
                      className="size-3 text-secondary-foreground"
                      strokeWidth={3}
                    />
                  </span>
                  <span className="text-[15px] font-semibold text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glow-primary mt-8 overflow-hidden rounded-sm border border-primary bg-card p-7 lg:mt-12 lg:p-11">
        <h2 className="font-heading text-[24px] font-black tracking-[-0.5px] text-navy lg:text-[32px]">
          {t("contactTitle")}
        </h2>
        <p className="mt-2 max-w-[560px] text-[15px] leading-[1.6] font-semibold text-muted-foreground lg:text-[17px]">
          {t("contactText")}
        </p>
        <div className="mt-4 flex flex-col gap-1.5 font-heading text-[15px] font-extrabold text-secondary lg:text-base">
          <span>{t("contactPhone")}</span>
          <span>{t("contactEmail")}</span>
        </div>
      </div>
    </Container>
  )
}
