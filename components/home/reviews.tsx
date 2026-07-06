import { cn } from "@/lib/utils"
import { Container } from "./container"

const REVIEWS = [
  {
    avatar: "ת",
    bg: "bg-pink",
    name: "תמר יוסף",
    quote: "״הילדים ביקשו לחזור אותו השבוע. מומלץ בחום!״",
  },
  {
    avatar: "א",
    bg: "bg-cyan",
    name: "איתי בר",
    quote: "״יום הולדת מושלם לבן. ההפקה היתה חלקה והצוות מקצועי.״",
  },
  {
    avatar: "ר",
    bg: "bg-marigold",
    name: "רונית כהן",
    quote:
      "״מקום נהדר, חגגנו שם יום הולדת לבן שלי! צוות מקצועי, אווירה מעולה.״",
  },
]

export function Reviews() {
  return (
    <Container className="pt-7 pb-1 lg:pt-14">
      <div className="mb-4 lg:mb-8 lg:flex lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 lg:order-2">
          <span className="font-heading text-[40px] leading-none font-black text-orange lg:text-[44px]">
            5.0
          </span>
          <div>
            <div className="text-lg tracking-[2px] text-marigold lg:text-xl">
              ★★★★★
            </div>
            <div className="text-xs font-bold text-mud lg:text-[13px]">
              מאות ביקורות מרוצות
            </div>
          </div>
        </div>
        <h2 className="mt-2.5 font-heading text-[28px] font-black tracking-[-1px] text-navy lg:order-1 lg:mt-0 lg:text-[44px]">
          מה המבלים אומרים עלינו?
        </h2>
      </div>
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-3 lg:gap-5">
        {REVIEWS.map((r) => (
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
                  r.bg
                )}
              >
                {r.avatar}
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
