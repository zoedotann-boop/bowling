import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import { DEFAULT_BRANCH } from "./lib/branches"

const LEGACY_SITE_PATHS = [
  "/menu",
  "/events/:path*",
  "/contact",
  "/terms",
  "/accessibility",
]

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return LEGACY_SITE_PATHS.map((source) => ({
      source,
      destination: `/${DEFAULT_BRANCH}${source}`,
      permanent: true,
    }))
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
