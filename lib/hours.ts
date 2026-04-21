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
