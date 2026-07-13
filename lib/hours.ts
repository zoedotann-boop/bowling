import { useEffect, useState } from "react"

// Both branches keep identical hours every day: 10:00 until 03:00 the next
// morning (see the footer hours in messages/*). Times are evaluated in Israel
// local time so the status is correct regardless of the visitor's timezone.
const OPEN_MINUTE = 10 * 60 // 10:00
const CLOSE_MINUTE = 3 * 60 // 03:00 (next day)

function isOpenNow(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === "hour")?.value)
  const minute = Number(parts.find((p) => p.type === "minute")?.value)
  const minutes = hour * 60 + minute
  // Open from 10:00 through midnight and again from midnight to 03:00.
  return minutes >= OPEN_MINUTE || minutes < CLOSE_MINUTE
}

/**
 * Live open/closed status, re-checked every minute so it flips at opening and
 * closing time without a reload. Returns `null` until mounted, keeping SSR and
 * the first client render in sync (no hydration mismatch); callers should treat
 * `null` as "assume open" for the initial paint.
 */
export function useIsOpen(): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null)
  useEffect(() => {
    const update = () => setOpen(isOpenNow())
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])
  return open
}
