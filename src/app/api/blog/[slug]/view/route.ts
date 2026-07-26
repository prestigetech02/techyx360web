import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false }, { status: 200 })
  }

  const { slug } = await context.params
  const trimmed = slug?.trim()

  if (!trimmed) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("increment_blog_post_views", {
      post_slug: trimmed,
    })

    if (error) {
      // Fallback if RPC migration is not applied yet
      const { data: post, error: lookupError } = await supabase
        .from("blog_posts")
        .select("id, view_count, status")
        .eq("slug", trimmed)
        .eq("status", "published")
        .maybeSingle()

      if (lookupError || !post) {
        console.error("Failed to increment blog views", error, lookupError)
        return NextResponse.json({ success: false }, { status: 200 })
      }

      const nextCount = (post.view_count ?? 0) + 1
      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({ view_count: nextCount })
        .eq("id", post.id)

      if (updateError) {
        console.error("Failed to update blog view count", updateError)
        return NextResponse.json({ success: false }, { status: 200 })
      }

      return NextResponse.json({ success: true, views: nextCount })
    }

    return NextResponse.json({ success: true, views: data ?? 0 })
  } catch (error) {
    console.error("Unexpected blog view tracking error", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
