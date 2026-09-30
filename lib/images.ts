export const BLOB_HOST = "public.blob.vercel-storage.com"
export const IMAGE_UPLOAD_ROUTE = "/api/admin/upload"
export const IMAGE_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

export function isOptimizableImage(src: string): boolean {
  if (/^\/(?!\/)/.test(src)) return true
  try {
    const { protocol, hostname } = new URL(src)
    return protocol === "https:" && hostname.endsWith(`.${BLOB_HOST}`)
  } catch {
    return false
  }
}
