import { useEffect, useState } from "react"

const OPEN_MINUTE = 10 * 60
const CLOSE_MINUTE = 3 * 60

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
  return minutes >= OPEN_MINUTE || minutes < CLOSE_MINUTE
}

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
