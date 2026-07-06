import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "./container"

const CONFIG = [
  { strip: "bg-orange", img: "/service-bowling.png", href: "/events" },
  { strip: "bg-gold", img: "/service-events.png", href: "/events" },
  { strip: "bg-teal", img: "/service-menu.png", href: "/menu" },
]

export function Services() {
  const t = useTranslations("services")
  const items = t.raw("items") as { title: string; desc: string; cta: string }[]

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4.5 lg:mb-7">
        <span className="font-mono text-[13px] font-bold text-teal lg:text-sm">
          {t("eyebrow")}
        </span>
        <h2 className="mt-1.5 font-heading text-[34px] font-black tracking-[-1px] text-navy lg:text-[48px]">
          {t("title")}
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {items.map((s, i) => (
          <Link
            key={s.title}
            href={CONFIG[i].href}
            className="block overflow-hidden rounded-[18px] border-[4px] border-navy bg-paper transition-transform hover:-translate-y-0.5 lg:rounded-[20px]"
          >
            <div
              className={cn("h-2 border-b-[4px] border-navy", CONFIG[i].strip)}
            />
            <div className="flex h-full items-center gap-3.5 bg-cream-warm p-[18px] lg:p-6">
              <Image
                src={CONFIG[i].img}
                alt={s.title}
                width={84}
                height={84}
                className="size-[74px] shrink-0 object-contain lg:size-[84px]"
              />
              <div>
                <div className="mb-1 font-heading text-xl font-black text-navy lg:text-[22px]">
                  {s.title}
                </div>
                <p className="mb-1.5 text-sm leading-normal font-semibold text-mud lg:text-[15px]">
                  {s.desc}
                </p>
                <span className="cursor-pointer font-heading text-sm font-extrabold text-red lg:text-[15px]">
                  {s.cta}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
