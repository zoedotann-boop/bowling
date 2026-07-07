"use client"

import { createContext, useCallback, useContext, useState } from "react"

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
  children,
}: {
  initial: BranchId
  children: React.ReactNode
}) {
  const [branchId, setBranchId] = useState<BranchId>(initial)

  const setBranch = useCallback((id: BranchId) => {
    setBranchId(id)
    // Persist so the server renders the same branch on the next request.
    document.cookie = `${BRANCH_COOKIE}=${id};path=/;max-age=${60 * 60 * 24 * 365}`
  }, [])

  return (
    <BranchContext.Provider
      value={{ branch: BRANCHES[branchId], branchId, setBranch }}
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
