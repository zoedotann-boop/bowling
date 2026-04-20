import type { Metadata } from "next"

import * as services from "@/lib/services"
import { MediaLibraryClient } from "@/components/admin/media-library-client"

export const metadata: Metadata = {
  title: "Admin · Media",
  robots: { index: false, follow: false },
}

export default async function AdminMediaPage() {
  const items = await services.media.list()
  return <MediaLibraryClient items={items} />
}
