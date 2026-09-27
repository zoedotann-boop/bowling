import Image from "next/image"

import type { Slogan } from "@/lib/slogans"
import { cn } from "@/lib/utils"

export function SloganWord({
  slogan,
  className,
}: {
  slogan: Slogan
  className?: string
}) {
  let glyphIndex = 0
  return (
    <span
      aria-hidden
      dir="ltr"
      className={cn("inline-flex items-end leading-none", className)}
    >
      {Array.from(slogan.word).map((char, i) => {
        if (char === " ") {
          return <span key={i} className="w-[0.24em]" />
        }
        const glyph = slogan.glyphs[glyphIndex++]
        const tight = i > 0 && slogan.word[i - 1] !== " "
        return (
          <Image
            key={i}
            src={glyph.src}
            alt=""
            width={glyph.width}
            height={glyph.height}
            unoptimized
            draggable={false}
            className={cn(
              "h-[1em] w-auto select-none",
              tight && "-ml-[0.015em]"
            )}
          />
        )
      })}
    </span>
  )
}
