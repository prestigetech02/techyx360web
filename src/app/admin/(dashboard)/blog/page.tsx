import Link from "next/link"
import { Plus } from "lucide-react"

import { BlogPostsDashboard } from "@/components/admin/blog-posts-dashboard"
import { Button } from "@/components/ui/button"
import { brand } from "@/config/brand"
import { getAdminBlogPosts } from "@/lib/blog/posts"
import { isSupabaseConfigured } from "@/lib/supabase"

export const metadata = {
  title: `Blog | Admin | ${brand.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts()

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-brand uppercase">
            Content
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Blog
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Create, edit, and publish blog posts for the Techyx360 website.
          </p>
        </div>

        <Button
          render={<Link href="/admin/blog/new" />}
          className="h-11 shrink-0 gap-2 rounded-xl bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus className="size-4" aria-hidden />
          Create post
        </Button>
      </div>

      {!isSupabaseConfigured() ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          New posts require Supabase. Existing static posts are shown below until
          database publishing is enabled.
        </div>
      ) : null}

      <BlogPostsDashboard posts={posts} />
    </div>
  )
}
