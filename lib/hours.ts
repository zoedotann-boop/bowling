import type { Branch, OpeningHours } from "./branches"

const dayMap: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

export function getTodayHours(branch: Branch): OpeningHours {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Jerusalem",
  }).format(new Date())
  return branch.hours[dayMap[day] ?? 0]
}

export function getNowMinutesIL(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jerusalem",
  }).formatToParts(new Date())
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0)
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0)
  return h * 60 + m
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (m ?? 0)
}

export function isOpenNow(branch: Branch): boolean {
  const today = getTodayHours(branch)
  const now = getNowMinutesIL()
  const open = toMinutes(today.open)
  let close = toMinutes(today.close)
  if (close <= open) close += 24 * 60
  const adjustedNow = now < open ? now + 24 * 60 : now
  return adjustedNow >= open && adjustedNow < close
}
