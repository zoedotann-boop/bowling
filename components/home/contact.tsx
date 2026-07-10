"use client"

import { useState } from "react"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/contact"
import { useBranch } from "@/components/branch-context"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

const ICONS = [MapPin, Mail, Phone, MessageCircle]

const inputClass =
  "rounded-sm border border-border bg-card px-4 py-3 text-[15px] font-semibold text-foreground placeholder:text-faint focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary lg:py-3.5"

export function Contact() {
  const t = useTranslations("contact")
  const { branch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const rawInfo = t.raw("info") as { title: string; value: string }[]
  // Address (0) and phone (2) come from the active branch.
  const info = rawInfo.map((item, i) =>
    i === 0
      ? { ...item, value: branch.addressFull[locale] }
      : i === 2
        ? { ...item, value: branch.phone }
        : item
  )
  // Per-card outbound links: Waze, email, phone, and WhatsApp (last card).
  const infoHrefs = [
    branch.wazeUrl,
    "mailto:info@bowling.co.il",
    `tel:${branch.phone}`,
    whatsappUrl(),
  ]
  const topics = t.raw("topics") as string[]
  const [topic, setTopic] = useState(topics[0])

  return (
    <section className="mt-6 border-t border-navy py-8 lg:mt-14 lg:py-16">
      <Container>
        <div className="mb-6 text-center lg:mb-9">
          <span className="font-mono text-xs font-bold text-secondary lg:text-sm"><LedDot color="secondary" className="me-2 align-middle" />
            {t("eyebrow")}
          </span>
          <h2 className="mt-1.5 font-heading text-[38px] font-black tracking-[-1px] text-foreground neon-sign-purple lg:text-[52px]">
            {t("title")}
          </h2>
          <div className="mx-auto mt-3 h-[7px] w-[70px] rounded-sm bg-primary lg:w-20" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          {info.map(({ title, value }, i) => {
            const Icon = ICONS[i]
            const href = infoHrefs[i]
            const cardClass =
              "block rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary lg:p-5"
            const inner = (
              <>
                <Icon className="size-5 text-rust" strokeWidth={2.5} />
                <div className="mt-1.5 font-heading text-[15px] font-extrabold text-navy lg:mt-2 lg:text-base">
                  {title}
                </div>
                <div className="text-[13px] font-semibold text-mud lg:text-sm">
                  {value}
                </div>
              </>
            )
            return href ? (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                {inner}
              </a>
            ) : (
              <div key={title} className={cardClass}>
                {inner}
              </div>
            )
          })}
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-sm border border-primary bg-card p-[22px] lg:p-8"
        >
          <div className="mb-4 font-heading text-[21px] font-black text-navy lg:mb-5 lg:text-2xl">
            {t("formTitle")}
          </div>
          <div className="mb-3.5 flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3.5">
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder={t("phonePlaceholder")}
              className={inputClass}
            />
          </div>
          <div className="mb-2 text-sm font-bold text-navy">
            {t("topicLabel")}
          </div>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {topics.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTopic(option)}
                className={cn(
                  "rounded-sm border border-navy px-3.5 py-1.5 text-[12.5px] font-extrabold transition-colors lg:px-4 lg:py-2 lg:text-[13px]",
                  topic === option
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-card text-foreground hover:border-secondary hover:text-secondary"
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <textarea
            placeholder={t("messagePlaceholder")}
            className={cn(
              inputClass,
              "mb-3.5 h-[88px] w-full resize-none lg:h-24"
            )}
          />
          <button
            type="submit"
            className="w-full rounded-sm border border-primary bg-primary px-5 py-3.5 font-heading text-[17px] font-black text-primary-foreground glow-primary transition-colors hover:bg-secondary hover:border-secondary hover:text-secondary-foreground lg:py-4 lg:text-lg"
          >
            {t("submit")}
          </button>
        </form>
      </Container>
    </section>
  )
}
