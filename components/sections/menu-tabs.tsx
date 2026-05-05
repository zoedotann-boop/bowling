"use client"

import * as React from "react"
import type { SiteMenuCategory } from "@/lib/site-branch"
import { BowlingCard } from "@/components/brand/bowling-card"

export function MenuTabs({ categories }: { categories: SiteMenuCategory[] }) {
  const [active, setActive] = React.useState(0)
  const safeIndex = Math.max(0, Math.min(active, categories.length - 1))
  const current = categories[safeIndex]

  if (categories.length === 0 || !current) return null

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-y-2 border-ink bg-cream sm:top-20 sm:-mx-6 lg:-mx-8">
        <div className="mx-auto max-w-4xl overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {categories.map((cat, i) => {
              const isActive = i === safeIndex
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-10 shrink-0 rounded-lg border-2 border-ink px-4 text-sm font-bold whitespace-nowrap transition active:translate-x-[1px] active:translate-y-[1px] ${
                    isActive
                      ? "bg-ink text-cream shadow-block-sm"
                      : "bg-paper text-ink hover:bg-cream"
                  }`}
                >
                  {cat.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BowlingCard
          surface="paper"
          ring="turq"
          shadow="md"
          contentClassName="px-4 py-3 sm:px-5"
        >
          <ul>
            {current.items.map((item, j) => (
              <li
                key={j}
                className={`py-3 ${
                  j < current.items.length - 1
                    ? "border-b border-dotted border-ink/30"
                    : ""
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-ink">
                    {item.name}
                  </span>
                  <span className="relative -top-0.5 flex-1 border-b border-dotted border-ink/40" />
                  <span className="font-display text-base text-red">
                    {item.price}
                  </span>
                </div>
                {item.tag ? (
                  <div className="mt-1 text-xs text-ink/70">{item.tag}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </BowlingCard>
      </div>
    </>
  )
}
