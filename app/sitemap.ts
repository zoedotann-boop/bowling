import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"

const PAGES = ["", "/prices", "/events", "/contact"] as const

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? ""
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin()
  const entries: MetadataRoute.Sitemap = []
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
  return entries
}
