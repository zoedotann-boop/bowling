export const tags = {
  branchAll: () => "branch:all" as const,
  branch: (slug: string) => `branch:${slug}` as const,
  branchHours: (slug: string) => `branch:${slug}:hours` as const,
  branchPrices: (slug: string) => `branch:${slug}:prices` as const,
  branchPackages: (slug: string) => `branch:${slug}:packages` as const,
  branchEvents: (slug: string) => `branch:${slug}:events` as const,
  branchMenu: (slug: string) => `branch:${slug}:menu` as const,
  mediaAll: () => "media:all" as const,
  media: (id: string) => `media:${id}` as const,
}
