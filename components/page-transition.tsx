"use client"

import { usePathname } from "next/navigation"

/**
 * Replays an enter animation on every client-side route change by remounting
 * its child subtree whenever the pathname changes.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  )
}
