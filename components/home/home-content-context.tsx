"use client"

import { createContext, useContext } from "react"

import { useBranch } from "@/components/branch-context"
import type { BranchHomeContent } from "@/lib/db/queries/site"

// Admin-editable home content for every branch, keyed by slug. Loaded once on
// the server (see app/(site)/page.tsx) and provided to the whole home page so
// sections update instantly when the branch is switched on the client.
const HomeContentContext = createContext<Record<string, BranchHomeContent>>({})

export function HomeContentProvider({
  content,
  children,
}: {
  content: Record<string, BranchHomeContent>
  children: React.ReactNode
}) {
  return (
    <HomeContentContext.Provider value={content}>
      {children}
    </HomeContentContext.Provider>
  )
}

// Returns the active branch's home content (or undefined when the database has
// no row yet — sections then fall back to their translated defaults).
export function useHomeContent(): BranchHomeContent | undefined {
  const content = useContext(HomeContentContext)
  const { branchId } = useBranch()
  return content[branchId]
}
