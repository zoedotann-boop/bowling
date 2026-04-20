import { describe, expect, it } from "vitest"

import {
  ALLOWED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
  validateUpload,
} from "../media-validation"

function fakeFile(size: number, type: string) {
  return { size, type } as Pick<File, "size" | "type">
}

describe("validateUpload", () => {
  it("accepts each allowed MIME type at a reasonable size", () => {
    for (const type of ALLOWED_UPLOAD_MIME) {
      expect(validateUpload(fakeFile(1024, type))).toEqual({ ok: true })
    }
  })

  it("rejects empty files", () => {
    expect(validateUpload(fakeFile(0, "image/png"))).toEqual({
      ok: false,
      reason: "empty",
    })
  })

  it("rejects files larger than MAX_UPLOAD_BYTES", () => {
    expect(
      validateUpload(fakeFile(MAX_UPLOAD_BYTES + 1, "image/jpeg"))
    ).toEqual({ ok: false, reason: "tooLarge" })
  })

  it("accepts files exactly at the size limit", () => {
    expect(validateUpload(fakeFile(MAX_UPLOAD_BYTES, "image/jpeg"))).toEqual({
      ok: true,
    })
  })

  it("rejects unsupported MIME types", () => {
    expect(validateUpload(fakeFile(1024, "application/pdf"))).toEqual({
      ok: false,
      reason: "badType",
    })
    expect(validateUpload(fakeFile(1024, "image/gif"))).toEqual({
      ok: false,
      reason: "badType",
    })
  })

  it("checks size before MIME type", () => {
    expect(
      validateUpload(fakeFile(MAX_UPLOAD_BYTES + 1, "application/pdf"))
    ).toEqual({ ok: false, reason: "tooLarge" })
  })
})
