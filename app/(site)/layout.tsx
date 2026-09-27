import { SiteChrome } from "@/components/site-chrome"

// A route group so the site chrome wraps every public page but never the admin.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SiteChrome>{children}</SiteChrome>
}
