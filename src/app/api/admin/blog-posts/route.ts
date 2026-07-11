import { NextResponse } from "next/server"

import { estimateReadTimeMins, slugify } from "@/lib/blog/posts"
import { requireAdmin } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseKeywords(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((keyword) => (typeof keyword === "string" ? keyword.trim() : ""))
    .filter(Boolean)
}

function parseTags(value: unknown) {
  return parseKeywords(value)
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 500 }
    )
  }

  const auth = await requireAdmin()
  if (!auth.authorized) {
    return auth.response
  }

  try {
    const body = (await request.json()) as Record<string, unknown>

    const title = sanitize(body.title)
    const slug = sanitize(body.slug) || slugify(title)
    const excerpt = sanitize(body.excerpt)
    const content = sanitize(body.content)
    const author = sanitize(body.author) || "Techyx360 Team"
    const featuredImage = sanitize(body.featuredImage)
    const featuredImageAlt = sanitize(body.featuredImageAlt)
    const publishedAt = sanitize(body.publishedAt)
    const status = sanitize(body.status)
    const tags = parseTags(body.tags)
    const metaDescription = sanitize(body.metaDescription)
    const metaKeywords = parseKeywords(body.metaKeywords)

    if (!title || !slug || !excerpt || !content || !featuredImage || !featuredImageAlt) {
      return NextResponse.json(
        { error: "Title, slug, excerpt, content, and featured image fields are required." },
        { status: 400 }
      )
    }

    if (!["draft", "published"].includes(status)) {
      return NextResponse.json({ error: "Invalid post status." }, { status: 400 })
    }

    if (!publishedAt) {
      return NextResponse.json(
        { error: "Published date is required." },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title,
        excerpt,
        content,
        author,
        tags,
        featured_image: featuredImage,
        featured_image_alt: featuredImageAlt,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords,
        read_time_mins: estimateReadTimeMins(content),
        status,
        published_at: publishedAt,
      })
      .select("id, slug, status")
      .single()

    if (error) {
      console.error("Failed to create blog post", error)
      return NextResponse.json(
        { error: "Unable to create blog post right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error("Unexpected blog post create error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
