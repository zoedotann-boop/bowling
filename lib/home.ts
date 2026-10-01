export const FEATURE_ICONS = ["lanes", "everyone", "bar", "openLate"] as const

export type FeatureIcon = (typeof FEATURE_ICONS)[number]

export const SERVICE_ICONS = [
  "bowling",
  "party",
  "menu",
  "gymboree",
  "team",
  "group",
  "drinks",
  "corporate",
  "clock",
] as const

export type ServiceIcon = (typeof SERVICE_ICONS)[number]

const SERVICE_DEFAULTS = ["bowling", "party", "menu"] as const

function iconAt<T extends string>(
  icons: readonly T[],
  defaults: readonly T[],
  icon: string,
  index: number
): T {
  return (icons as readonly string[]).includes(icon)
    ? (icon as T)
    : defaults[index % defaults.length]
}

export function featureIconAt(icon: string, index: number): FeatureIcon {
  return iconAt(FEATURE_ICONS, FEATURE_ICONS, icon, index)
}

export function serviceIconAt(icon: string, index: number): ServiceIcon {
  return iconAt(SERVICE_ICONS, SERVICE_DEFAULTS, icon, index)
}
