"use client"

import { createContext, useContext } from "react"

import { BRANCHES, type Branch, type BranchId } from "@/lib/branches"

interface BranchContextValue {
  branch: Branch
  branchId: BranchId
  visibleBranches: Branch[]
}

const BranchContext = createContext<BranchContextValue | null>(null)

export function BranchProvider({
  branchId,
  branches,
  children,
}: {
  branchId: BranchId
  branches?: Record<BranchId, Branch>
  children: React.ReactNode
}) {
  const all = branches ?? BRANCHES
  const branch = all[branchId]
  const visibleBranches = Object.values(all).filter(
    (item) => item.isVisible || item.id === branchId
  )

  return (
    <BranchContext.Provider value={{ branch, branchId, visibleBranches }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const value = useContext(BranchContext)
  if (!value) {
    throw new Error("useBranch must be used within a BranchProvider")
  }
  return value
}
