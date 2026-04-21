import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"

import { ForbiddenError, requireAdmin } from "@/lib/auth-guards"
import * as services from "@/lib/services"
import { validateUpload } from "@/lib/services/media"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let session
  try {
    session = await requireAdmin()
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    throw error
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalidMultipart" }, { status: 400 })
  }

  const branchId = readTrimmed(formData, "branchId")
  if (!branchId) {
    return NextResponse.json({ error: "missingBranchId" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missingFile" }, { status: 400 })
  }

  const validation = validateUpload(file)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 })
  }

  const altTextHe = readTrimmed(formData, "altTextHe")
  const altTextEn = readTrimmed(formData, "altTextEn")
  const altTextRu = readTrimmed(formData, "altTextRu")
  const altTextAr = readTrimmed(formData, "altTextAr")

  const safeName =
    file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") ||
    "upload"

  const uploaded = await put(`media/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  })

  const created = await services.media.create({
    branchId,
    blobUrl: uploaded.url,
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    uploadedBy: session.user.id,
    altTextHe,
    altTextEn,
    altTextRu,
    altTextAr,
  })

  if (!created.ok) {
    await del(uploaded.url).catch(() => {})
    return NextResponse.json(
      { error: "persistFailed", fieldErrors: created.fieldErrors },
      { status: 500 }
    )
  }

  return NextResponse.json({ asset: created.data }, { status: 201 })
}

function readTrimmed(formData: FormData, key: string): string | null {
  const raw = formData.get(key)
  if (typeof raw !== "string") return null
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : null
}
