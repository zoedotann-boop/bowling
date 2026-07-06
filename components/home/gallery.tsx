import { cn } from "@/lib/utils"
import { Container } from "./container"

const TILES = [
  { label: "תמונה 1", bg: "bg-red", text: "text-paper", cls: "" },
  { label: "תמונה 2", bg: "bg-cyan", text: "text-navy", cls: "" },
  {
    label: "תמונה 3",
    bg: "bg-navy",
    text: "text-paper",
    cls: "col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2",
  },
  { label: "תמונה 4", bg: "bg-marigold", text: "text-navy", cls: "" },
  { label: "תמונה 5", bg: "bg-cyan", text: "text-navy", cls: "" },
]

export function Gallery() {
  return (
    <section className="mt-6 border-y-[4px] border-navy bg-cream-warm py-7 lg:mt-14 lg:py-14">
      <Container>
        <span className="font-mono text-[13px] font-bold text-marigold lg:text-sm">
          רגעים מהמתחם
        </span>
        <h2 className="mt-1.5 mb-4 font-heading text-[34px] font-black tracking-[-1px] text-navy lg:mb-6 lg:text-[48px]">
          המתחם בתמונות
        </h2>
        <div className="grid [grid-auto-rows:120px] grid-cols-2 gap-3 lg:[grid-auto-rows:180px] lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-4">
          {TILES.map((t) => (
            <div
              key={t.label}
              className={cn(
                "flex items-center justify-center rounded-[16px] border-[4px] border-navy font-mono text-xs font-bold lg:rounded-[18px]",
                t.bg,
                t.text,
                t.cls
              )}
            >
              [{t.label}]
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-full border-[3px] border-navy bg-cream px-6 py-3 font-heading text-[15px] font-extrabold text-navy transition-colors hover:bg-cyan lg:mt-6 lg:w-auto">
          לכל הגלריה <span className="text-red">←</span>
        </button>
      </Container>
    </section>
  )
}
