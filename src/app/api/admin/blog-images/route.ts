import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/admin/require-admin"
import { optimizeBlogFeaturedImage } from "@/lib/blog/optimize-featured-image"
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
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      )
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

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    let optimized: Awaited<ReturnType<typeof optimizeBlogFeaturedImage>>

    try {
      optimized = await optimizeBlogFeaturedImage(fileBuffer)
    } catch (error) {
      console.error("Failed to optimize blog image", error)
      return NextResponse.json(
        { error: "Unable to process this image. Try a different JPG or PNG." },
        { status: 400 }
      )
    }

    const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
    const featuredPath = `featured/${id}.${optimized.featured.extension}`
    const ogPath = `featured/${id}-og.${optimized.og.extension}`

    const supabase = createAdminClient()

    const [featuredUpload, ogUpload] = await Promise.all([
      supabase.storage.from(BUCKET).upload(featuredPath, optimized.featured.buffer, {
        contentType: optimized.featured.contentType,
        upsert: false,
        cacheControl: "31536000",
      }),
      supabase.storage.from(BUCKET).upload(ogPath, optimized.og.buffer, {
        contentType: optimized.og.contentType,
        upsert: false,
        cacheControl: "31536000",
      }),
    ])

    if (featuredUpload.error || ogUpload.error) {
      console.error(
        "Failed to upload blog image",
        featuredUpload.error ?? ogUpload.error
      )
      return NextResponse.json(
        { error: "Unable to upload image right now." },
        { status: 500 }
      )
    }

    const featuredUrl = supabase.storage.from(BUCKET).getPublicUrl(featuredPath)
      .data.publicUrl
    const ogUrl = supabase.storage.from(BUCKET).getPublicUrl(ogPath).data
      .publicUrl

    return NextResponse.json({
      success: true,
      url: featuredUrl,
      ogUrl,
      path: featuredPath,
      ogPath,
      bytes: {
        featured: optimized.featured.buffer.byteLength,
        og: optimized.og.buffer.byteLength,
      },
    })
  } catch (error) {
    console.error("Unexpected blog image upload error", error)
    return NextResponse.json(
      { error: "Unable to process upload." },
      { status: 500 }
    )
  }
}
