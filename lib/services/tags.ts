export const tags = {
  branchAll: () => "branch:all" as const,
  branch: (slug: string) => `branch:${slug}` as const,
  branchHours: (slug: string) => `branch:${slug}:hours` as const,
  branchPrices: (slug: string) => `branch:${slug}:prices` as const,
  branchPackages: (slug: string) => `branch:${slug}:packages` as const,
  branchMenu: (slug: string) => `branch:${slug}:menu` as const,
  branchReviews: (slug: string) => `branch:${slug}:reviews` as const,
  branchDomains: (branchId: string) => `branch:${branchId}:domains` as const,
  domainAll: () => "domain:all" as const,
  domainHost: (host: string) => `domain:host:${host.toLowerCase()}` as const,
  mediaBranch: (branchId: string) => `media:branch:${branchId}` as const,
  media: (id: string) => `media:${id}` as const,
  legalBranch: (branchId: string) => `legal:branch:${branchId}` as const,
  legal: (branchId: string, slug: string) =>
    `legal:${branchId}:${slug}` as const,
}
