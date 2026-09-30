import { useEffect, useState } from "react"

import type { DayHours } from "@/lib/db/schema/locations"
import { isOpenAt } from "@/lib/hours"

export function useIsOpen(hours: DayHours[]): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null)
  useEffect(() => {
    const update = () => setOpen(isOpenAt(hours, new Date()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [hours])
  return open
}
