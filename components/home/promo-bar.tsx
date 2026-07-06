import { useTranslations } from "next-intl"

function MarqueeHalf({ text, hidden }: { text: string; hidden?: boolean }) {
  return (
    <div className="flex shrink-0" aria-hidden={hidden}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="flex items-center py-2.5 font-mono text-[13px] font-bold tracking-wide whitespace-nowrap text-paper lg:text-sm"
        >
          {text}
          <span className="px-6 text-marigold">★</span>
        </span>
      ))}
    </div>
  )
}

export function PromoBar() {
  const t = useTranslations("promo")
  const text = t("text")

  return (
    <div className="overflow-hidden border-b-[4px] border-navy bg-red">
      <div className="flex w-max animate-marquee" dir="ltr">
        <MarqueeHalf text={text} />
        <MarqueeHalf text={text} hidden />
      </div>
    </div>
  )
}
