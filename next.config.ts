import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Serve the venue slogan letter graphics (public/slogans/*.svg). These are
    // first-party, trusted assets; the locked-down CSP neutralises any embedded
    // scripts per the Next.js guidance for dangerouslyAllowSVG.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
