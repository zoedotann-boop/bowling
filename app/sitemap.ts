import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { branches } from "@/lib/branches"

const PAGES = ["", "/prices", "/events", "/contact"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  for (const branch of branches) {
    const origin = `https://${branch.domains[0]}`
    for (const locale of routing.locales) {
      for (const page of PAGES) {
        entries.push({
          url: `${origin}/${locale}${page}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: page === "" ? 1.0 : 0.7,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((l) => [l, `${origin}/${l}${page}`])
            ),
          },
        })
      }
    }
  }
  return entries
}
