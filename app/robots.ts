import type { MetadataRoute } from "next"
import { branches } from "@/lib/branches"

export default function robots(): MetadataRoute.Robots {
  const sitemaps = branches.map((b) => `https://${b.domains[0]}/sitemap.xml`)
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: sitemaps,
  }
}
