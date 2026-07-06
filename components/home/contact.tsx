"use client"

import { useState } from "react"
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "./container"

const ICONS = [MapPin, Mail, Phone, MessageCircle]

const inputClass =
  "rounded-xl border-[3px] border-navy bg-paper px-4 py-3 text-[15px] font-semibold text-navy placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-marigold lg:py-3.5"

export function Contact() {
  const t = useTranslations("contact")
  const info = t.raw("info") as { title: string; value: string }[]
  const topics = t.raw("topics") as string[]
  const [topic, setTopic] = useState(topics[0])

  return (
    <section className="mt-6 border-t-[4px] border-navy bg-teal py-8 lg:mt-14 lg:py-16">
      <Container>
        <div className="mb-6 text-center lg:mb-9">
          <span className="font-mono text-xs font-bold text-orange lg:text-sm">
            {t("eyebrow")}
          </span>
          <h2 className="mt-1.5 font-heading text-[38px] font-black tracking-[-1px] text-cream-warm lg:text-[52px]">
            {t("title")}
          </h2>
          <div className="mx-auto mt-3 h-[7px] w-[70px] rounded-full bg-rust lg:w-20" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
          {info.map(({ title, value }, i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={title}
                className="rounded-[16px] border-[4px] border-dashed border-orange bg-cream-warm p-4 lg:rounded-[18px] lg:p-5"
              >
                <Icon className="size-5 text-rust" strokeWidth={2.5} />
                <div className="mt-1.5 font-heading text-[15px] font-extrabold text-navy lg:mt-2 lg:text-base">
                  {title}
                </div>
                <div className="text-[13px] font-semibold text-mud lg:text-sm">
                  {value}
                </div>
              </div>
            )
          })}
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-[20px] border-[4px] border-dashed border-orange bg-cream-warm p-[22px] lg:rounded-[22px] lg:p-8"
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
                  "rounded-full border-[3px] border-navy px-3.5 py-1.5 text-[12.5px] font-extrabold transition-colors lg:px-4 lg:py-2 lg:text-[13px]",
                  topic === option ? "bg-rust text-paper" : "bg-paper text-navy"
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
            className="w-full rounded-full border-[3px] border-navy bg-rust px-5 py-3.5 font-heading text-[17px] font-black text-paper transition-colors hover:bg-navy lg:py-4 lg:text-lg"
          >
            {t("submit")}
          </button>
        </form>
      </Container>
    </section>
  )
}
