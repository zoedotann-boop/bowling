export const FEATURE_ICONS = ["lanes", "everyone", "bar", "openLate"] as const

export type FeatureIcon = (typeof FEATURE_ICONS)[number]

export function featureIconAt(icon: string, index: number): FeatureIcon {
  return (FEATURE_ICONS as readonly string[]).includes(icon)
    ? (icon as FeatureIcon)
    : FEATURE_ICONS[index % FEATURE_ICONS.length]
}
