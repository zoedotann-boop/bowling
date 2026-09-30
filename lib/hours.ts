import type { DayHours } from "@/lib/db/schema/locations"

function toMinutes(time: string | undefined): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time ?? "")
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

function israelTime(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    hourCycle: "h23",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now)
  const value = (type: string) => parts.find((p) => p.type === type)?.value
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    value("weekday") ?? ""
  )
  return { day, minutes: Number(value("hour")) * 60 + Number(value("minute")) }
}

function span(entry: DayHours | undefined) {
  if (!entry || entry.closed) return null
  const open = toMinutes(entry.open)
  const close = toMinutes(entry.close)
  if (open === null || close === null) return null
  return { open, close, overnight: close <= open }
}

export function isOpenAt(hours: DayHours[], now: Date): boolean {
  const { day, minutes } = israelTime(now)
  const today = span(hours.find((entry) => entry.day === day))
  const yesterday = span(hours.find((entry) => entry.day === (day + 6) % 7))

  if (
    today &&
    minutes >= today.open &&
    (today.overnight || minutes < today.close)
  ) {
    return true
  }
  return Boolean(yesterday?.overnight && minutes < yesterday.close)
}

function sameHours(a: DayHours, b: DayHours): boolean {
  return (
    a.closed === b.closed &&
    (a.closed || (a.open === b.open && a.close === b.close))
  )
}

export function formatHours(
  hours: DayHours[],
  dayNames: string[],
  closedLabel: string
): string[] {
  const days = [...hours].sort((a, b) => a.day - b.day)
  const groups: DayHours[][] = []
  for (const entry of days) {
    const last = groups.at(-1)
    if (
      last &&
      sameHours(last[0], entry) &&
      last.at(-1)!.day === entry.day - 1
    ) {
      last.push(entry)
    } else {
      groups.push([entry])
    }
  }

  return groups.map((group) => {
    const first = dayNames[group[0].day]
    const last = dayNames[group.at(-1)!.day]
    const label = group.length > 1 ? `${first}–${last}` : first
    const time = group[0].closed
      ? closedLabel
      : `${group[0].open}–${group[0].close}`
    return `${label} · ${time}`
  })
}
