export const ALLOWED_UPLOAD_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export type UploadValidationError = "badType" | "tooLarge" | "empty"

export function validateUpload(
  file: Pick<File, "size" | "type">
): { ok: true } | { ok: false; reason: UploadValidationError } {
  if (file.size === 0) return { ok: false, reason: "empty" }
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "tooLarge" }
  if (!(ALLOWED_UPLOAD_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, reason: "badType" }
  }
  return { ok: true }
}
