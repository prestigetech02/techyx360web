import { NextResponse } from "next/server"

import { estimateReadTimeMins } from "@/lib/blog/posts"
import { requireAdmin } from "@/lib/admin/require-admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseTags(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean)
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params

  try {
    const body = (await request.json()) as Record<string, unknown>

    const title = sanitize(body.title)
    const slug = sanitize(body.slug)
    const excerpt = sanitize(body.excerpt)
    const content = sanitize(body.content)
    const author = sanitize(body.author)
    const featuredImage = sanitize(body.featuredImage)
    const featuredImageAlt = sanitize(body.featuredImageAlt)
    const publishedAt = sanitize(body.publishedAt)
    const status = sanitize(body.status)
    const tags = parseTags(body.tags)

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
      .neq("id", id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists." },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        slug,
        title,
        excerpt,
        content,
        author: author || "Techyx360 Team",
        tags,
        featured_image: featuredImage,
        featured_image_alt: featuredImageAlt,
        read_time_mins: estimateReadTimeMins(content),
        status,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, slug, status")
      .single()

    if (error) {
      console.error("Failed to update blog post", error)
      return NextResponse.json(
        { error: "Unable to update blog post right now." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post: data })
  } catch (error) {
    console.error("Unexpected blog post update error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("blog_posts").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete blog post", error)
      return NextResponse.json(
        { error: "Unable to delete blog post." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected blog post delete error", error)
    return NextResponse.json(
      { error: "Unable to process request." },
      { status: 500 }
    )
  }
}
