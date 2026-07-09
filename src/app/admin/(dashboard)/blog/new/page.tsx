import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BlogPostForm } from "@/components/admin/blog-post-form"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Create Post | Blog | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminBlogNewPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-w-0 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            render={<Link href="/admin/blog" />}
            aria-label="Back to blog posts"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
              Content
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              Create post
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm text-muted-foreground sm:text-base">
            Supabase is not configured yet. Add your env keys and run the
            `blog_posts` and `blog-images` SQL migrations before creating
            posts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          render={<Link href="/admin/blog" />}
          aria-label="Back to blog posts"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Content
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Create post
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write and publish a new article for the Techyx360 blog.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <BlogPostForm mode="create" />
      </div>
    </div>
  )
}
