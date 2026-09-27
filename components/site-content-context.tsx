"use client"

import { createContext, useContext } from "react"

import type { BranchId } from "@/lib/branches"
import type { SiteHomeContent } from "@/lib/db/queries/site"
import { useBranch } from "@/components/branch-context"

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

export function useSiteContent(): SiteHomeContent | undefined {
  const map = useContext(SiteContentContext)
  const { branchId } = useBranch()
  return map[branchId]
}
