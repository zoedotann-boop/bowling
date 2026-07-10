"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { useLocale } from "next-intl"

import { cn } from "@/lib/utils"
import { BRANCHES, branchIds } from "@/lib/branches"
import { useBranch } from "@/components/branch-context"

export function BranchSwitcher({ className }: { className?: string }) {
  const { branchId, setBranch } = useBranch()
  const locale = useLocale() as "he" | "en"
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-navy bg-card px-3.5 py-[7px] text-[13px] font-extrabold text-navy transition-colors hover:border-secondary hover:text-secondary",
          className
        )}
      >
        {BRANCHES[branchId].name[locale]}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={3}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-sm border border-navy bg-card"
        >
          {branchIds.map((id) => {
            const active = id === branchId
            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setBranch(id)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-3 text-start font-heading text-sm font-extrabold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "text-navy hover:bg-cream-warm hover:text-secondary"
                )}
              >
                {BRANCHES[id].name[locale]}
                {active && (
                  <Check className="size-4 flex-none" strokeWidth={3} />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
