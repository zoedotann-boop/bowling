"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { saveBranchCookie, type Branch, type BranchId } from "@/lib/branches"
import { LaneLines } from "@/components/decor/lane-lines"
import { NeonSign } from "@/components/decor/neon-sign"
import { PinsSettle } from "@/components/decor/pins-settle"
import { Container } from "./container"
import { LangToggle } from "./lang-toggle"

export function BranchChooser({ branches }: { branches: Branch[] }) {
  const t = useTranslations("branchChooser")
  const locale = useLocale() as "he" | "en"
  const router = useRouter()
  const pathname = usePathname()
  const [chosen, setChosen] = useState<BranchId | null>(null)
  const [isPending, startTransition] = useTransition()

  const choose = (id: BranchId) => {
    saveBranchCookie(id)
    setChosen(id)
    startTransition(() => {
      if (pathname === "/") router.refresh()
      else router.push("/")
    })
  }

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-cream">
      <LaneLines />

      <Container className="flex justify-end pt-5">
        <LangToggle />
      </Container>

      <Container className="flex flex-1 flex-col items-center justify-center py-12 text-center lg:py-16">
        <PinsSettle className="mb-4 lg:mb-5" />
        <NeonSign flicker className="mb-6 lg:mb-7" />

        <h1 className="font-heading text-[34px] leading-[1.05] font-black tracking-[-1px] text-navy lg:text-[52px] lg:tracking-[-1.5px]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-[560px] text-base leading-[1.6] font-medium text-mud lg:text-[18px]">
          {t("subtitle")}
        </p>

        <ul className="mt-10 grid w-full max-w-[880px] gap-5 text-start sm:grid-cols-2 lg:mt-12 lg:gap-6">
          {branches.map((branch) => {
            const name = branch.name[locale]
            return (
              <li key={branch.id}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card transition duration-200 focus-within:border-primary hover:-translate-y-1 hover:border-primary",
                    chosen === branch.id && "glow-primary border-primary"
                  )}
                >
                  <div className="flex aspect-[16/9] items-center justify-center border-b border-border bg-cream-warm p-8">
                    <Image
                      src={branch.logo.src}
                      alt=""
                      width={branch.logo.width}
                      height={branch.logo.height}
                      priority
                      className="h-full max-h-32 w-auto object-contain"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-sm border border-cyan px-2.5 py-0.5 font-heading text-[12px] font-extrabold text-cyan">
                        {t("lanes", { count: branch.lanes })}
                      </span>
                      {branch.hasGymboree && (
                        <span className="rounded-sm border border-red px-2.5 py-0.5 font-heading text-[12px] font-extrabold text-red">
                          {t("gymboree")}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 font-heading text-[24px] leading-tight font-black text-navy lg:text-[26px]">
                      {name}
                    </h2>
                    <p className="mt-1.5 text-[15px] leading-[1.55] font-medium text-mud">
                      {branch.addressFull[locale]}
                    </p>

                    <button
                      type="button"
                      onClick={() => choose(branch.id)}
                      disabled={isPending}
                      aria-label={t("enterBranch", { name })}
                      className="mt-auto inline-flex items-center gap-1.5 pt-5 font-heading text-base font-extrabold text-primary outline-none after:absolute after:inset-0 disabled:cursor-wait"
                    >
                      {t("enter")}
                      <ChevronLeft
                        className="size-5 transition-transform group-hover:-translate-x-1 ltr:rotate-180 ltr:group-hover:translate-x-1"
                        strokeWidth={3}
                      />
                    </button>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </Container>
    </main>
  )
}
