"use client"

import { createContext, useContext, useEffect, useState } from "react"

import {
  BRANCH_COOKIE,
  BRANCHES,
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
  // DB-backed branch data (merged over the hardcoded defaults by the caller).
  // Optional so the provider still works without a database (falls back to the
  // static BRANCHES).
  branches?: Record<BranchId, Branch>
  children: React.ReactNode
}) {
  const [branchId, setBranchId] = useState<BranchId>(initial)

  // Persist the selection so the server renders the same branch next request.
  useEffect(() => {
    document.cookie = `${BRANCH_COOKIE}=${branchId};path=/;max-age=${60 * 60 * 24 * 365}`
  }, [branchId])

  const branch = branches?.[branchId] ?? BRANCHES[branchId]

  return (
    <BranchContext.Provider
      value={{ branch, branchId, setBranch: setBranchId }}
    >
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
