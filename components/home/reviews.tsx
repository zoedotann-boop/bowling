import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "./container"

const AVATAR_BG = ["bg-pink", "bg-cyan", "bg-marigold"]

export function Reviews() {
  const t = useTranslations("reviews")
  const items = t.raw("items") as { name: string; quote: string }[]

  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4 lg:mb-8">
        <h2 className="font-heading text-[28px] font-black tracking-[-1px] text-navy lg:text-[44px]">
          {t("title")}
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {items.map((r, i) => (
          <div
            key={r.name}
            className="rounded-[18px] border-[4px] border-navy bg-paper p-5 lg:rounded-[20px] lg:p-6"
          >
            <div className="mb-2.5 text-base tracking-[2px] text-marigold lg:mb-3 lg:text-[17px]">
              ★★★★★
            </div>
            <p className="mb-3.5 text-[15px] leading-[1.55] font-semibold text-navy lg:mb-4 lg:text-[15.5px] lg:leading-[1.6]">
              {r.quote}
            </p>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-[3px] border-navy font-heading font-extrabold text-navy lg:size-[38px]",
                  AVATAR_BG[i]
                )}
              >
                {r.name.charAt(0)}
              </span>
              <span className="font-heading text-[15px] font-extrabold text-navy">
                {r.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
