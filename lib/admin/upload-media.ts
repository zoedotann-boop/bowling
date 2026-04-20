import type { MediaAssetRead } from "@/lib/services/media"

export type UploadMediaInput = {
  file: File
  altTextHe?: string | null
  altTextEn?: string | null
  altTextRu?: string | null
  altTextAr?: string | null
}

export type UploadMediaResult =
  | { ok: true; asset: MediaAssetRead }
  | { ok: false; reason: string }

export async function uploadMedia(
  input: UploadMediaInput
): Promise<UploadMediaResult> {
  const fd = new FormData()
  fd.append("file", input.file)
  if (input.altTextHe) fd.append("altTextHe", input.altTextHe)
  if (input.altTextEn) fd.append("altTextEn", input.altTextEn)
  if (input.altTextRu) fd.append("altTextRu", input.altTextRu)
  if (input.altTextAr) fd.append("altTextAr", input.altTextAr)

  const response = await fetch("/api/admin/media/upload", {
    method: "POST",
    body: fd,
  })
  if (!response.ok) {
    let reason = "uploadFailed"
    try {
      const data = (await response.json()) as { error?: string }
      if (typeof data.error === "string") reason = data.error
    } catch {
      // ignore body parse errors
    }
    return { ok: false, reason }
  }
  const data = (await response.json()) as { asset: MediaAssetRead }
  return { ok: true, asset: data.asset }
}
