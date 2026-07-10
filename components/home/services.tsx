import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

const CONFIG = [
  { strip: "bg-primary", img: "/icons/bowling.png", href: "/events" },
  { strip: "bg-secondary", img: "/icons/events.png", href: "/events" },
  { strip: "bg-primary", img: "/icons/menu.png", href: "/menu" },
]

export function Services() {
  const t = useTranslations("services")
  const items = t.raw("items") as { title: string; desc: string; cta: string }[]

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4.5 lg:mb-7">
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          <LedDot className="me-2 align-middle" />
          {t("eyebrow")}
        </span>
        <h2 className="mt-1.5 font-heading text-[34px] font-black tracking-[-1px] neon-sign-purple lg:text-[48px]">
          {t("title")}
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {items.map((s, i) => (
          <Link
            key={s.title}
            href={CONFIG[i].href}
            className="block overflow-hidden border border-border bg-paper transition-colors hover:border-primary"
          >
            <div className={cn("h-1", CONFIG[i].strip)} />
            <div className="flex h-full items-center gap-4 p-[18px] lg:p-6">
              <Image
                src={CONFIG[i].img}
                alt=""
                width={329}
                height={207}
                className="h-[68px] w-auto shrink-0 lg:h-20"
              />
              <div>
                <div className="mb-1 font-heading text-xl font-black text-navy lg:text-[22px]">
                  {s.title}
                </div>
                <p className="mb-1.5 text-sm leading-normal font-medium text-mud lg:text-[15px]">
                  {s.desc}
                </p>
                {i !== 0 && (
                  <span className="cursor-pointer font-heading text-sm font-extrabold text-red lg:text-[15px]">
                    {s.cta}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
