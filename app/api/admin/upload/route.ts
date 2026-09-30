import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

import { getSessionUser } from "@/lib/admin/access"
import { can } from "@/lib/admin/permissions"
import { IMAGE_UPLOAD_MAX_BYTES, IMAGE_UPLOAD_TYPES } from "@/lib/images"

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getSessionUser()
        if (!user || !can(user.role, "content")) {
          throw new Error("Unauthorized")
        }
        return {
          allowedContentTypes: IMAGE_UPLOAD_TYPES,
          maximumSizeInBytes: IMAGE_UPLOAD_MAX_BYTES,
          addRandomSuffix: true,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
