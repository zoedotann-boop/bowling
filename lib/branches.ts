import type { location } from "@/lib/db/schema"

export type BranchId = "ramat-gan" | "rishon"

interface Localized {
  he: string
  en: string
}

export interface Branch {
  id: BranchId
  name: Localized
  addressLine1: Localized
  addressLine2: Localized
  addressFull: Localized
  phone: string
  whatsapp: string
  lanes: number
  laneDesc: Localized
  wazeUrl: string
  logo: { src: string; width: number; height: number }
  hasGymboree: boolean
  hasNotice: boolean
  events: string[]
}

const waze = (query: string) =>
  `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`

export const BRANCHES: Record<BranchId, Branch> = {
  "ramat-gan": {
    id: "ramat-gan",
    name: { he: "סניף רמת גן", en: "Ramat Gan Branch" },
    addressLine1: { he: "דרך אבא הלל 301", en: "Aba Hillel Rd 301" },
    addressLine2: {
      he: "(אצטדיון ר״ג שער 2)",
      en: "(Ramat Gan Stadium, Gate 2)",
    },
    addressFull: {
      he: "דרך אבא הלל 301 (אצטדיון ר״ג שער 2)",
      en: "Aba Hillel Rd 301 (Ramat Gan Stadium, Gate 2)",
    },
    phone: "03-5700834",
    whatsapp: "972549854428",
    lanes: 14,
    laneDesc: {
      he: "14 מסלולים עם ציוד מקצועי ותאורת LED",
      en: "14 lanes with pro equipment and LED lighting",
    },
    wazeUrl: waze("דרך אבא הלל 301, רמת גן"),
    logo: { src: "/logo-ramat-gan.png", width: 604, height: 374 },
    hasGymboree: false,
    hasNotice: true,
    events: ["birthdays", "team", "corporate"],
  },
  rishon: {
    id: "rishon",
    name: { he: "סניף ראשון לציון", en: "Rishon LeZion Branch" },
    addressLine1: { he: "שדרות היהודים 24", en: "HaYehudim Blvd 24" },
    addressLine2: { he: "(קניון אזוריאון)", en: "(Azorion Mall)" },
    addressFull: {
      he: "שדרות היהודים 24 (קניון אזוריאון)",
      en: "HaYehudim Blvd 24 (Azorion Mall)",
    },
    phone: "03-9550021",
    whatsapp: "972549629579",
    lanes: 16,
    laneDesc: {
      he: "16 מסלולים עם ציוד מקצועי ותאורת LED",
      en: "16 lanes with pro equipment and LED lighting",
    },
    wazeUrl: waze("שדרות היהודים 24, ראשון לציון"),
    logo: { src: "/logo-rishon.png", width: 370, height: 233 },
    hasGymboree: true,
    hasNotice: false,
    events: ["birthdays", "gymboree", "no-room", "team", "corporate"],
  },
}

export const branchIds = Object.keys(BRANCHES) as BranchId[]
export const DEFAULT_BRANCH: BranchId = "ramat-gan"
export const BRANCH_COOKIE = "BRANCH"
const BRANCH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function saveBranchCookie(id: BranchId) {
  document.cookie = `${BRANCH_COOKIE}=${id};path=/;max-age=${BRANCH_COOKIE_MAX_AGE}`
}

export function isBranchId(value: unknown): value is BranchId {
  return typeof value === "string" && value in BRANCHES
}

export function byBranch<T extends { slug: string }>(
  rows: T[]
): Partial<Record<BranchId, T>> {
  const map: Partial<Record<BranchId, T>> = {}
  for (const row of rows) {
    if (isBranchId(row.slug)) map[row.slug] = row
  }
  return map
}

type BranchRow = typeof location.$inferSelect

function localizedOr(
  value: { he?: string; en?: string } | null,
  fallback: Localized
): Localized {
  return {
    he: value?.he?.trim() || fallback.he,
    en: value?.en?.trim() || fallback.en,
  }
}

export function mergeBranch(base: Branch, row: BranchRow | undefined): Branch {
  if (!row) return base
  return {
    ...base,
    name: localizedOr(row.name, base.name),
    addressLine1: localizedOr(row.addressLine1, base.addressLine1),
    addressLine2: localizedOr(row.addressLine2, base.addressLine2),
    addressFull: localizedOr(row.addressFull, base.addressFull),
    laneDesc: localizedOr(row.laneDesc, base.laneDesc),
    phone: row.phone || base.phone,
    whatsapp: row.whatsapp || base.whatsapp,
    wazeUrl: row.wazeUrl || base.wazeUrl,
    lanes: row.lanes || base.lanes,
    hasGymboree: row.hasGymboree,
    hasNotice: row.hasNotice,
  }
}
