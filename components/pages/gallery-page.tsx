import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "@/components/home/container"

const TILES = [
  { bg: "bg-red", text: "text-paper", cls: "lg:col-span-2 lg:row-span-2" },
  { bg: "bg-cyan", text: "text-navy", cls: "" },
  { bg: "bg-marigold", text: "text-navy", cls: "" },
  { bg: "bg-teal", text: "text-cream-warm", cls: "" },
  { bg: "bg-navy", text: "text-paper", cls: "" },
  { bg: "bg-pink", text: "text-navy", cls: "lg:col-span-2" },
  { bg: "bg-gold", text: "text-navy", cls: "" },
  { bg: "bg-cyan", text: "text-navy", cls: "" },
]

export function GalleryPage() {
  const t = useTranslations("galleryPage")

  return (
    <Container className="py-9 lg:py-16">
      <div className="mb-7 lg:mb-11">
        <span className="font-mono text-[13px] font-bold text-marigold lg:text-sm">
          {t("eyebrow")}
        </span>
        <h1 className="mt-1.5 font-heading text-[40px] font-black leading-none tracking-[-1.5px] text-navy lg:text-[56px]">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] font-semibold text-mud lg:text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 [grid-auto-rows:120px] sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 lg:[grid-auto-rows:190px]">
        {TILES.map((tile, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center rounded-[16px] border-[4px] border-navy font-mono text-xs font-bold lg:rounded-[18px]",
              tile.bg,
              tile.text,
              tile.cls
            )}
          >
            [{t("imageLabel", { n: i + 1 })}]
          </div>
        ))}
      </div>
    </Container>
  )
}
