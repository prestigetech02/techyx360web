import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const BUCKET = "blog-images"
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    default:
      return "jpg"
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, and GIF images are allowed." },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 }
      )
    }

    const extension = getFileExtension(file)
    const objectPath = `featured/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Failed to upload blog image", error)
      return NextResponse.json(
        { error: "Unable to upload image right now." },
        { status: 500 }
      )
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path: objectPath,
    })
  } catch (error) {
    console.error("Unexpected blog image upload error", error)
    return NextResponse.json(
      { error: "Unable to process upload." },
      { status: 500 }
    )
  }
}
