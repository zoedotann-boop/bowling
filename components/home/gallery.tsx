"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Container } from "./container"

// Each tile maps to an image in /public/gallery. The third tile spans two rows
// on desktop to keep the original mosaic layout.
const TILES = [
  { src: "/gallery/1.png", cls: "" },
  { src: "/gallery/2.png", cls: "" },
  {
    src: "/gallery/3.png",
    cls: "col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2",
  },
  { src: "/gallery/4.png", cls: "" },
  { src: "/gallery/5.png", cls: "" },
]

export function Gallery() {
  const t = useTranslations("gallery")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const show = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + TILES.length) % TILES.length
      ),
    []
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      else if (e.key === "ArrowRight") show(1)
      else if (e.key === "ArrowLeft") show(-1)
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [openIndex, close, show])

  return (
    <section className="mt-6 border-y-[4px] border-navy bg-cream-warm py-7 lg:mt-14 lg:py-14">
      <Container>
        <span className="font-mono text-[13px] font-bold text-marigold lg:text-sm">
          {t("eyebrow")}
        </span>
        <h2 className="mt-1.5 mb-4 font-heading text-[34px] font-black tracking-[-1px] text-navy lg:mb-6 lg:text-[48px]">
          {t("title")}
        </h2>
        <div className="grid [grid-auto-rows:120px] grid-cols-2 gap-3 lg:[grid-auto-rows:180px] lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-4">
          {TILES.map((tile, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={t("imageLabel", { n: i + 1 })}
              className={cn(
                "group relative overflow-hidden rounded-[16px] border-[4px] border-navy lg:rounded-[18px]",
                tile.cls
              )}
            >
              <Image
                src={tile.src}
                alt={t("imageLabel", { n: i + 1 })}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </Container>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute end-4 top-4 flex size-11 items-center justify-center rounded-full border-[3px] border-paper bg-navy text-2xl font-black text-paper transition-colors hover:bg-rust"
          >
            ×
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              show(-1)
            }}
            aria-label="Previous"
            className="absolute start-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-paper bg-navy text-2xl font-black text-paper transition-colors hover:bg-rust lg:start-8"
          >
            ‹
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-[18px] border-[4px] border-paper"
          >
            <Image
              src={TILES[openIndex].src}
              alt={t("imageLabel", { n: openIndex + 1 })}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              show(1)
            }}
            aria-label="Next"
            className="absolute end-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-paper bg-navy text-2xl font-black text-paper transition-colors hover:bg-rust lg:end-8"
          >
            ›
          </button>
        </div>
      )}
    </section>
  )
}
