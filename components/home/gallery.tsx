"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

// Each tile maps to an image in /public/gallery. Intrinsic dimensions let the
// lightbox size each image to its natural aspect ratio. The third tile spans
// two rows on desktop to keep the original mosaic layout.
const TILES = [
  { src: "/gallery/1.png", w: 795, h: 463, cls: "" },
  { src: "/gallery/2.png", w: 782, h: 459, cls: "" },
  {
    src: "/gallery/3.png",
    w: 756,
    h: 461,
    cls: "col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2",
  },
  { src: "/gallery/4.png", w: 757, h: 461, cls: "" },
  { src: "/gallery/5.png", w: 862, h: 1252, cls: "" },
]

// Minimum horizontal travel (px) that counts as a navigation swipe.
const SWIPE_THRESHOLD = 50

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

  // Track the initial touch so a horizontal drag navigates instead of closing.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      show(dx < 0 ? 1 : -1)
    }
  }

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
    <section className="mt-6 border-y border-navy py-7 lg:mt-14 lg:py-14">
      <Container>
        <span className="font-mono text-[13px] font-bold text-secondary lg:text-sm">
          <LedDot className="me-2 align-middle" />
          {t("eyebrow")}
        </span>
        <h2 className="neon-sign-purple mt-1.5 mb-4 font-heading text-[34px] font-black tracking-[-1px] lg:mb-6 lg:text-[48px]">
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
                "group glow-primary hover:glow-cyan relative overflow-hidden rounded-sm border border-navy transition-shadow",
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

      {/* Lightbox — portaled to <body> so a transformed ancestor (the
          .animate-page-in wrapper) can't become the containing block for
          `position: fixed` and drop the overlay far down the page. openIndex
          is null on the server, so the portal only runs after a client click. */}
      {openIndex !== null &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/90 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="glow-primary hover:glow-cyan absolute end-4 top-4 z-10 flex size-11 items-center justify-center rounded-full border border-primary bg-card text-2xl font-black text-primary transition-colors hover:border-secondary hover:text-secondary"
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
              className="glow-primary hover:glow-cyan absolute start-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-card text-2xl font-black text-primary transition-colors hover:border-secondary hover:text-secondary lg:start-8"
            >
              ‹
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              // The frame matches each image's aspect ratio and grows to the
              // largest size that still fits within 92vw × 88vh, so `fill`
              // scales the image up to fill the screen without cropping.
              style={{
                aspectRatio: `${TILES[openIndex].w} / ${TILES[openIndex].h}`,
                width: `min(92vw, calc(88vh * ${TILES[openIndex].w} / ${TILES[openIndex].h}))`,
              }}
              className="glow-primary relative overflow-hidden rounded-sm border border-primary"
            >
              <Image
                src={TILES[openIndex].src}
                alt={t("imageLabel", { n: openIndex + 1 })}
                fill
                sizes="92vw"
                className="object-cover"
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
              className="glow-primary hover:glow-cyan absolute end-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-card text-2xl font-black text-primary transition-colors hover:border-secondary hover:text-secondary lg:end-8"
            >
              ›
            </button>
          </div>,
          document.body
        )}
    </section>
  )
}
