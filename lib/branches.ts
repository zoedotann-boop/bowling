// Branch data for the two locations. The active branch is stored in a cookie
// and exposed through BranchProvider (components/branch-context.tsx).

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
  lanes: number
  laneDesc: Localized
  wazeUrl: string
  /** Branch-specific brand logo (used in the header and footer). */
  logo: { src: string; width: number; height: number }
  /** Rishon LeZion also has a gymboree + bumper tubes attraction. */
  hasGymboree: boolean
  /** Shows the branch-specific notice pop-up when true. */
  hasNotice: boolean
  /** Event slugs offered at this branch, in display order. */
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

export function isBranchId(value: unknown): value is BranchId {
  return typeof value === "string" && value in BRANCHES
}
