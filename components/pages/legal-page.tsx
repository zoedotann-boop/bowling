"use client"

import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { useBranch } from "@/components/branch-context"
import { Container } from "@/components/home/container"
import type { BranchId } from "@/lib/branches"
import type { SiteLegalPage } from "@/lib/db/queries/site"
import {
  LEGAL_DEFAULT_UPDATED_AT,
  type LegalBlock,
  type LegalPageKind,
  parseLegalBody,
} from "@/lib/legal"
import type { Locale } from "@/lib/locales"

function formatUpdated(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jerusalem",
  }).format(date)
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return blocks.map((block, index) =>
    block.type === "paragraph" ? (
      <p key={index} className="whitespace-pre-line">
        {block.text}
      </p>
    ) : (
      <ul key={index} className="flex flex-col gap-3">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 flex-none items-center justify-center rounded-full border border-secondary bg-secondary">
              <Check
                className="size-3 text-secondary-foreground"
                strokeWidth={3}
              />
            </span>
            <span className="text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    )
  )
}

export function LegalPage({
  kind,
  pages,
}: {
  kind: LegalPageKind
  pages: Partial<Record<BranchId, SiteLegalPage>>
}) {
  const t = useTranslations("legalPages")
  const locale = useLocale() as Locale
  const { branchId } = useBranch()

  const page = pages[branchId]
  const custom = page?.body[locale]?.trim()
  const body = custom || (t.raw(`${kind}.defaultBody`) as string[]).join("\n")
  const updatedAt =
    custom && page ? page.updatedAt : new Date(LEGAL_DEFAULT_UPDATED_AT[kind])
  const { intro, sections } = parseLegalBody(body)

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          {t(`${kind}.eyebrow`)}
        </span>
        <h1 className="neon-sign-purple mt-1.5 font-heading text-[40px] leading-none font-black tracking-[-1.5px] lg:text-[56px]">
          {t(`${kind}.title`)}
        </h1>
        <p className="mt-2 font-mono text-[12.5px] font-bold text-faint lg:text-[13px]">
          {t("updated", { date: formatUpdated(updatedAt, locale) })}
        </p>
      </div>

      <div className="flex max-w-3xl flex-col gap-4 text-[15px] leading-[1.7] font-semibold text-mud lg:text-[17px]">
        <Blocks blocks={intro} />
      </div>

      <div className="mt-8 flex max-w-4xl flex-col gap-4 lg:mt-12">
        {sections.map((section, index) => (
          <section
            key={index}
            className="rounded-sm border border-border bg-card p-6 transition-colors hover:border-primary lg:p-8"
          >
            <h2 className="font-heading text-[22px] font-black tracking-[-0.5px] text-navy lg:text-[26px]">
              {section.title}
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-[15px] leading-[1.6] font-semibold text-muted-foreground">
              <Blocks blocks={section.blocks} />
            </div>
          </section>
        ))}
      </div>
    </Container>
  )
}
