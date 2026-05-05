import type { SiteBranch, SiteHours } from "./site-branch"

const dayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function getTodayHours(branch: SiteBranch): SiteHours {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Jerusalem",
  }).format(new Date())
  return branch.hours[dayMap[day] ?? 0]!
}

function parseHHMM(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (Number.isNaN(h) || Number.isNaN(min)) return null
  return h * 60 + min
}

function getNowMinutesJerusalem(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  return hour * 60 + minute
}

// Handles overnight closures (e.g. 12:00→02:00 next day).
export function isOpenNow(today: SiteHours): boolean {
  if (today.isClosed) return false
  const open = parseHHMM(today.open)
  const close = parseHHMM(today.close)
  if (open === null || close === null) return false
  if (close === open) return false
  const now = getNowMinutesJerusalem()
  if (close > open) return now >= open && now < close
  return now >= open || now < close
}
