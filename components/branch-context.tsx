"use client"

import { createContext, useContext } from "react"

import { BRANCHES, type Branch, type BranchId } from "@/lib/branches"

interface BranchContextValue {
  branch: Branch
  branchId: BranchId
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
  const branch = branches?.[branchId] ?? BRANCHES[branchId]

  return (
    <BranchContext.Provider value={{ branch, branchId }}>
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
