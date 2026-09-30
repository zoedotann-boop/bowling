"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type TouchEvent,
} from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

import { cn, isRemoteImage } from "@/lib/utils"
import { pickLocale } from "@/lib/localized"
import { useSiteContent } from "@/components/site-content-context"
import { LedDot } from "@/components/decor/led-dot"
import { Container } from "./container"

interface Tile {
  src: string
  alt?: string
  ratio?: number
}

const TILES: Tile[] = [
  { src: "/gallery/1.png", ratio: 795 / 463 },
  { src: "/gallery/2.png", ratio: 782 / 459 },
  { src: "/gallery/3.png", ratio: 756 / 461 },
  { src: "/gallery/4.png", ratio: 757 / 461 },
  { src: "/gallery/5.png", ratio: 862 / 1252 },
]
const TILE_CLASSES: Partial<Record<number, string>> = {
  2: "col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2",
}
const DEFAULT_RATIO = 4 / 3

const SWIPE_THRESHOLD = 50

const subscribe = () => () => {}

export function Gallery() {
  const t = useTranslations("gallery")
  const locale = useLocale() as "he" | "en"
  const content = useSiteContent()
  const title = pickLocale(content?.home?.galleryTitle, locale)
  const images = (content?.galleryImages ?? []).filter((image) =>
    image.imageUrl.trim()
  )
  const tiles: Tile[] = images.length
    ? images.map((image) => ({
        src: image.imageUrl,
        alt: pickLocale(image.alt, locale),
      }))
    : TILES
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const portalTarget = useSyncExternalStore(
    subscribe,
    () => document.body,
    () => null
  )

  const openRatio =
    openIndex === null
      ? DEFAULT_RATIO
      : (tiles[openIndex].ratio ?? DEFAULT_RATIO)

  const close = useCallback(() => setOpenIndex(null), [])
  const show = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + tiles.length) % tiles.length
      ),
    [tiles.length]
  )

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
          {title || t("title")}
        </h2>
        <div className="grid [grid-auto-rows:120px] grid-cols-2 gap-3 lg:[grid-auto-rows:180px] lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-4">
          {tiles.map((tile, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={t("imageLabel", { n: i + 1 })}
              className={cn(
                "group glow-primary hover:glow-cyan relative overflow-hidden rounded-sm border border-navy transition-shadow",
                TILE_CLASSES[i]
              )}
            >
              <Image
                src={tile.src}
                alt={tile.alt || t("imageLabel", { n: i + 1 })}
                unoptimized={isRemoteImage(tile.src)}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </Container>

      {portalTarget &&
        openIndex !== null &&
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
              style={{
                aspectRatio: openRatio,
                width: `min(92vw, calc(88vh * ${openRatio}))`,
              }}
              className="glow-primary relative overflow-hidden rounded-sm border border-primary"
            >
              <Image
                src={tiles[openIndex].src}
                alt={
                  tiles[openIndex].alt || t("imageLabel", { n: openIndex + 1 })
                }
                unoptimized={isRemoteImage(tiles[openIndex].src)}
                fill
                sizes="92vw"
                className={
                  tiles[openIndex].ratio ? "object-cover" : "object-contain"
                }
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
          portalTarget
        )}
    </section>
  )
}
