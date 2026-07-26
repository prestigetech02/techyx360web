"use client"

import { useEffect } from "react"

type BlogPostViewTrackerProps = {
  slug: string
  enabled?: boolean
}

/**
 * Records one view per browser tab session for a published post.
 */
export function BlogPostViewTracker({
  slug,
  enabled = true,
}: BlogPostViewTrackerProps) {
  useEffect(() => {
    if (!enabled || !slug) return

    const key = `techyx360:blog-view:${slug}`

    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, "1")
    } catch {
      // sessionStorage may be blocked; still attempt one count
    }

    void fetch(`/api/blog/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // Tracking failures should never affect reading
    })
  }, [slug, enabled])

  return null
}
