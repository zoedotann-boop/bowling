"use client"

import { createContext, useContext } from "react"

import type { BranchId } from "@/lib/branches"
import type { SiteHomeContent } from "@/lib/db/queries/site"
import { useBranch } from "@/components/branch-context"

// DB-backed home + chrome content, keyed by branch (location slug). Populated in
// app/(site)/layout.tsx and swapped client-side when the branch switcher changes
// the active branch — mirroring how BranchProvider carries branch data.
export type SiteContentMap = Partial<Record<BranchId, SiteHomeContent>>

const SiteContentContext = createContext<SiteContentMap>({})

export function SiteContentProvider({
  content,
  children,
}: {
  content: SiteContentMap
  children: React.ReactNode
}) {
  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  )
}

// The active branch's content, or undefined when the DB has none (components
// then fall back to their next-intl copy).
export function useSiteContent(): SiteHomeContent | undefined {
  const map = useContext(SiteContentContext)
  const { branchId } = useBranch()
  return map[branchId]
}
