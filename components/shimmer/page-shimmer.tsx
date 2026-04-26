"use client"

import type { ReactNode } from "react"
import { Shimmer } from "shimmer-from-structure"

export function PageShimmer({ children }: { children: ReactNode }) {
  return (
    <Shimmer
      loading
      backgroundColor="rgba(0,0,0,0.06)"
      shimmerColor="rgba(0,0,0,0.12)"
      fallbackBorderRadius={6}
    >
      {children}
    </Shimmer>
  )
}
