"use client"

import { createContext, useContext, useState } from "react"

import {
  BRANCHES,
  saveBranchCookie,
  type Branch,
  type BranchId,
} from "@/lib/branches"

interface BranchContextValue {
  branch: Branch
  branchId: BranchId
  setBranch: (id: BranchId) => void
}

const BranchContext = createContext<BranchContextValue | null>(null)

export function BranchProvider({
  initial,
  branches,
  children,
}: {
  initial: BranchId
  branches?: Record<BranchId, Branch>
  children: React.ReactNode
}) {
  const [branchId, setBranchId] = useState<BranchId>(initial)

  const branch = branches?.[branchId] ?? BRANCHES[branchId]

  const setBranch = (id: BranchId) => {
    saveBranchCookie(id)
    setBranchId(id)
  }

  return (
    <BranchContext.Provider value={{ branch, branchId, setBranch }}>
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
