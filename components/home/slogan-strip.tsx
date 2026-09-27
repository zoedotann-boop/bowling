import { Fragment } from "react"

import { SloganWord } from "@/components/decor/slogan-word"
import { SLOGANS } from "@/lib/slogans"

export function SloganStrip() {
  return (
    <section
      aria-hidden
      className="overflow-hidden border-y border-border bg-cream-warm py-5 lg:py-7"
    >
      <div className="flex flex-nowrap items-center justify-center gap-x-[0.5em] px-4 text-[clamp(0.3rem,1.65vw,2.4rem)]">
        {SLOGANS.map((slogan, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span className="size-[0.5em] shrink-0 rounded-full bg-primary" />
            )}
            <SloganWord slogan={slogan} className="shrink-0" />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
